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

/** The corners jsQR reports for a QR it read. */
interface QrCorners {
  topLeftCorner: { x: number; y: number };
  topRightCorner: { x: number; y: number };
  bottomRightCorner: { x: number; y: number };
  bottomLeftCorner: { x: number; y: number };
}

/** The rectangle that contains the corners of a QR, moved by the origin of the area it was read from. */
function boxOf(location: QrCorners, offsetX: number, offsetY: number): QrRegion {
  const corners = [
    location.topLeftCorner,
    location.topRightCorner,
    location.bottomRightCorner,
    location.bottomLeftCorner,
  ];
  const left = Math.min(...corners.map((c) => c.x));
  const top = Math.min(...corners.map((c) => c.y));
  return {
    x: Math.round(offsetX + left),
    y: Math.round(offsetY + top),
    width: Math.round(Math.max(...corners.map((c) => c.x)) - left),
    height: Math.round(Math.max(...corners.map((c) => c.y)) - top),
  };
}

/**
 * Reads the bytes of the QR code in a camera frame with `jsQR`. It has no dependency on Angular or on
 * the page, so the same code runs in a Web Worker (off the main thread) or, where workers are
 * unavailable, in the page itself.
 *
 * When the native detector located the QR, only the area around it is read; if that gives nothing, or
 * no area is known, the whole frame is read.
 */
export class QrFrameReader {
  private canvas: OffscreenCanvas | null = null;
  private boxes: QrRegion[] = [];

  /**
   * Where, in frame pixels, each QR read by the last {@link read} was (in no particular order), so the
   * screen can draw a frame over it. Empty when nothing was read.
   */
  public get lastBoxes(): readonly QrRegion[] {
    return this.boxes;
  }

  /**
   * Reads the QR of a frame: from the area where the detector located it and, if that gives nothing
   * (or no area is known), from the whole frame.
   *
   * @param bitmap - The camera frame. The caller releases it.
   * @param regions - Areas around the QR, when the detector located it; only the first is used. Empty reads the whole frame.
   * @returns The payload bytes of the QR read (at most one); empty when it could not be read.
   */
  public read(bitmap: QrSource, regions: readonly QrRegion[]): Uint8Array[] {
    this.boxes = [];
    const bytes =
      (regions.length > 0 ? this.readRegion(bitmap, regions[0]) : null) ?? this.readWhole(bitmap);
    return bytes ? [bytes] : [];
  }

  private readRegion(bitmap: QrSource, region: QrRegion): Uint8Array | null {
    const pixels = this.pixelsOf(bitmap, region);
    if (!pixels) {
      return null;
    }
    const code = jsQR(pixels.data, pixels.width, pixels.height, {
      inversionAttempts: 'dontInvert',
    });
    if (!code) {
      return null;
    }
    this.boxes.push(boxOf(code.location, region.x, region.y));
    return Uint8Array.from(code.binaryData);
  }

  /** Reads the QR from the whole frame. */
  private readWhole(bitmap: QrSource): Uint8Array | null {
    return this.readRegion(bitmap, { x: 0, y: 0, width: bitmap.width, height: bitmap.height });
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
}
