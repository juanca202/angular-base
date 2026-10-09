import jsQR from 'jsqr';

/** Area of a frame, in pixels. */
export interface QrRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** A camera frame in any of the forms the reading accepts. */
export type QrSource = CanvasImageSource & { readonly width: number; readonly height: number };

/** Margin added around the box of a detected QR, as a fraction of its size, so no module is cut. */
const REGION_MARGIN = 0.25;

/**
 * Area of a frame around a QR box, with a margin so no module is cut, kept inside the frame.
 *
 * @param box - Where the native detector found the QR.
 * @param frame - Size of the frame.
 * @returns The area to read, or `null` when the box is empty.
 */
export function regionAround(
  box: QrRegion | undefined,
  frame: { width: number; height: number },
): QrRegion | null {
  if (!box || box.width <= 0 || box.height <= 0) {
    return null;
  }
  const marginX = box.width * REGION_MARGIN;
  const marginY = box.height * REGION_MARGIN;
  const x = Math.max(0, Math.floor(box.x - marginX));
  const y = Math.max(0, Math.floor(box.y - marginY));
  const right = Math.min(frame.width, Math.ceil(box.x + box.width + marginX));
  const bottom = Math.min(frame.height, Math.ceil(box.y + box.height + marginY));
  return right > x && bottom > y ? { x, y, width: right - x, height: bottom - y } : null;
}

/** Most QR codes read from one frame (the sender shows at most two). */
export const MAX_CODES_PER_FRAME = 4;

/** QR codes looked for in a frame when no area is known: the sender shows at most two. */
const DEFAULT_EXPECTED_CODES = 2;

/** A pixel is dark (part of a QR) when its brightness is below this value (0 to 255). */
const DARK_BELOW = 110;
/** Share of a column's sampled pixels that may be dark for the column to count as empty. */
const EMPTY_COLUMN_RATIO = 0.01;
/** The empty band between two QR codes must be at least this share of the frame width. */
const MIN_GAP_RATIO = 0.02;
/** Each side of the empty band must hold at least this share of the frame width in dark columns. */
const MIN_SIDE_RATIO = 0.05;

/** Margin, in pixels, painted white around a QR already read so the next search skips it. */
const MASK_MARGIN = 6;

/**
 * Reads the bytes of the QR codes in a camera frame with `jsQR`. It has no dependency on Angular or on
 * the page, so the same code runs in a Web Worker (off the main thread) or, where workers are
 * unavailable, in the page itself.
 *
 * `jsQR` cannot read anything when two QR codes are in the same picture (their finder patterns get
 * mixed up), so each code is read from its own area. When no area is known (no native detector, or
 * it failed) and the whole frame gives nothing, the frame is split at the empty vertical band between
 * two groups of dark columns (the sender shows its two QR codes side by side) and each side is read
 * apart. The split follows the band wherever it is, so the two codes need not be centred; a frame
 * without such a band (a single QR, or nothing) costs only the column scan.
 */
export class QrFrameReader {
  private canvas: OffscreenCanvas | null = null;

  /**
   * Reads the QR codes of a frame: one per area where the detector located a QR and, if none of those
   * areas gives anything (or no area is known), by searching the whole frame for up to as many codes as
   * areas were given (at least one).
   *
   * @param bitmap - The camera frame. The caller releases it.
   * @param regions - Areas around the QR codes, when their positions are known; empty reads the whole frame.
   * @returns The payload bytes of every QR read, in no particular order; empty when none could be read.
   */
  public read(bitmap: QrSource, regions: readonly QrRegion[]): Uint8Array[] {
    const found = regions
      .map((region) => this.readRegion(bitmap, region))
      .filter((bytes): bytes is Uint8Array => bytes !== null);
    if (found.length > 0) {
      return found;
    }
    // Without areas the sender may be showing two QR codes, so a second one is looked for after the first.
    const expected = regions.length === 0 ? DEFAULT_EXPECTED_CODES : regions.length;
    return this.readWhole(bitmap, Math.min(MAX_CODES_PER_FRAME, expected));
  }

  private readRegion(bitmap: QrSource, region: QrRegion): Uint8Array | null {
    const pixels = this.pixelsOf(bitmap, region);
    if (!pixels) {
      return null;
    }
    const code = jsQR(pixels.data, pixels.width, pixels.height, {
      inversionAttempts: 'dontInvert',
    });
    return code ? Uint8Array.from(code.binaryData) : null;
  }

  /**
   * Searches the whole frame for up to `max` QR codes: after each one is read, the area it occupies is
   * painted white so the next search finds another.
   */
  private readWhole(bitmap: QrSource, max: number): Uint8Array[] {
    const pixels = this.pixelsOf(bitmap, {
      x: 0,
      y: 0,
      width: bitmap.width,
      height: bitmap.height,
    });
    const found: Uint8Array[] = [];
    while (pixels && found.length < max) {
      const code = jsQR(pixels.data, pixels.width, pixels.height, {
        inversionAttempts: 'dontInvert',
      });
      if (!code) {
        break;
      }
      found.push(Uint8Array.from(code.binaryData));
      this.mask(pixels, [
        code.location.topLeftCorner,
        code.location.topRightCorner,
        code.location.bottomRightCorner,
        code.location.bottomLeftCorner,
      ]);
    }
    return found.length > 0 || !pixels ? found : this.readSides(bitmap, pixels);
  }

  /** Splits the frame at the empty band between two QR codes and reads each side apart. */
  private readSides(bitmap: QrSource, pixels: ImageData): Uint8Array[] {
    const split = this.findSplit(pixels);
    if (split === null) {
      return [];
    }
    return [
      { x: 0, y: 0, width: split, height: bitmap.height },
      { x: split, y: 0, width: bitmap.width - split, height: bitmap.height },
    ]
      .map((region) => this.readRegion(bitmap, region))
      .filter((bytes): bytes is Uint8Array => bytes !== null);
  }

  /**
   * Column where to split the frame: the middle of the widest run of empty columns that has dark
   * columns on both sides, or `null` when there is no such band.
   */
  private findSplit(pixels: ImageData): number | null {
    const { data, width, height } = pixels;
    const dark = new Uint32Array(width);
    let rows = 0;
    for (let y = 0; y < height; y += 2) {
      rows++;
      for (let x = 0; x < width; x++) {
        const at = (y * width + x) * 4;
        if ((data[at] * 299 + data[at + 1] * 587 + data[at + 2] * 114) / 1000 < DARK_BELOW) {
          dark[x]++;
        }
      }
    }
    const empty = (x: number) => dark[x] <= rows * EMPTY_COLUMN_RATIO;
    const minGap = Math.max(4, Math.round(width * MIN_GAP_RATIO));
    const minSide = Math.max(4, Math.round(width * MIN_SIDE_RATIO));
    const darkBefore = new Uint32Array(width + 1);
    for (let x = 0; x < width; x++) {
      darkBefore[x + 1] = darkBefore[x] + (empty(x) ? 0 : 1);
    }
    let best: { start: number; end: number } | null = null;
    for (let x = 0; x < width;) {
      if (!empty(x)) {
        x++;
        continue;
      }
      const start = x;
      while (x < width && empty(x)) {
        x++;
      }
      const left = darkBefore[start];
      const right = darkBefore[width] - darkBefore[x];
      const isBand = x - start >= minGap && left >= minSide && right >= minSide;
      if (isBand && (!best || x - start > best.end - best.start)) {
        best = { start, end: x };
      }
    }
    return best ? Math.round((best.start + best.end) / 2) : null;
  }

  private pixelsOf(bitmap: QrSource, region: QrRegion): ImageData | null {
    const { x, y, width, height } = region;
    if (width <= 0 || height <= 0) {
      return null;
    }
    this.canvas ??= new OffscreenCanvas(width, height);
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
    const context = this.canvas.getContext('2d', { willReadFrequently: true });
    if (!context) {
      return null;
    }
    context.drawImage(bitmap, x, y, width, height, 0, 0, width, height);
    return context.getImageData(0, 0, width, height);
  }

  /** Paints white the rectangle that contains the given corners, plus a margin. */
  private mask(pixels: ImageData, corners: readonly { x: number; y: number }[]): void {
    const left = Math.max(0, Math.floor(Math.min(...corners.map((c) => c.x))) - MASK_MARGIN);
    const right = Math.min(
      pixels.width,
      Math.ceil(Math.max(...corners.map((c) => c.x))) + MASK_MARGIN,
    );
    const top = Math.max(0, Math.floor(Math.min(...corners.map((c) => c.y))) - MASK_MARGIN);
    const bottom = Math.min(
      pixels.height,
      Math.ceil(Math.max(...corners.map((c) => c.y))) + MASK_MARGIN,
    );
    for (let row = top; row < bottom; row++) {
      pixels.data.fill(255, (row * pixels.width + left) * 4, (row * pixels.width + right) * 4);
    }
  }
}
