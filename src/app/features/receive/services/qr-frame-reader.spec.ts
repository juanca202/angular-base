import { create } from 'qrcode';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { QrFrameReader, regionAround } from '@/features/receive/services/qr-frame-reader';

/** Side of one QR in the test picture, in pixels. */
const SIDE = 150;
/** Gap between the two QR codes of the wide picture. */
const GAP = 30;
const PAYLOAD = Uint8Array.from({ length: 40 }, (_, i) => (i * 37 + 11) & 0xff);
const OTHER = Uint8Array.from({ length: 40 }, (_, i) => (i * 53 + 5) & 0xff);

/** A real, readable QR as RGBA pixels, SIDE × SIDE. */
function qrPixels(payload: Uint8Array): Uint8ClampedArray {
  const qr = create([{ data: payload, mode: 'byte' }], { errorCorrectionLevel: 'M' });
  const modules = qr.modules.size;
  const quiet = 4;
  const scale = Math.floor(SIDE / (modules + quiet * 2));
  const offset = Math.floor((SIDE - (modules + quiet * 2) * scale) / 2) + quiet * scale;
  const pixels = new Uint8ClampedArray(SIDE * SIDE * 4).fill(255);
  for (let row = 0; row < modules; row++) {
    for (let col = 0; col < modules; col++) {
      if (!qr.modules.data[row * modules + col]) continue;
      for (let dy = 0; dy < scale; dy++) {
        for (let dx = 0; dx < scale; dx++) {
          const at = ((offset + row * scale + dy) * SIDE + offset + col * scale + dx) * 4;
          pixels[at] = pixels[at + 1] = pixels[at + 2] = 0;
        }
      }
    }
  }
  return pixels;
}

/** A white picture with the given QR codes side by side, from the left. */
function picture(payloads: Uint8Array[]): {
  data: Uint8ClampedArray;
  width: number;
  height: number;
} {
  const width = payloads.length * SIDE + (payloads.length - 1) * GAP;
  const data = new Uint8ClampedArray(width * SIDE * 4).fill(255);
  payloads.forEach((payload, n) => {
    const qr = qrPixels(payload);
    const left = n * (SIDE + GAP);
    for (let row = 0; row < SIDE; row++) {
      data.set(qr.subarray(row * SIDE * 4, (row + 1) * SIDE * 4), (row * width + left) * 4);
    }
  });
  return { data, width, height: SIDE };
}

/** A real QR drawn with `scale` pixels per module, as RGBA pixels and its side. */
function qrPixelsSized(
  payload: Uint8Array,
  scale: number,
): { pixels: Uint8ClampedArray; side: number } {
  const qr = create([{ data: payload, mode: 'byte' }], { errorCorrectionLevel: 'M' });
  const modules = qr.modules.size;
  const quiet = 4;
  const side = (modules + quiet * 2) * scale;
  const pixels = new Uint8ClampedArray(side * side * 4).fill(255);
  for (let row = 0; row < modules; row++) {
    for (let col = 0; col < modules; col++) {
      if (!qr.modules.data[row * modules + col]) continue;
      for (let dy = 0; dy < scale; dy++) {
        for (let dx = 0; dx < scale; dx++) {
          const at = (((row + quiet) * scale + dy) * side + (col + quiet) * scale + dx) * 4;
          pixels[at] = pixels[at + 1] = pixels[at + 2] = 0;
        }
      }
    }
  }
  return { pixels, side };
}

describe('QrFrameReader', () => {
  let drawImage: ReturnType<typeof vi.fn>;
  let getImageData: ReturnType<typeof vi.fn>;
  let current: ReturnType<typeof picture>;

  /** Frame (bitmap) as large as the picture currently in front of the camera. */
  const bitmap = () => ({ width: current.width, height: current.height }) as ImageBitmap;
  const show = (...payloads: Uint8Array[]) => {
    current = picture(payloads);
  };

  beforeEach(() => {
    show(PAYLOAD);
    let origin = { x: 0, y: 0 };
    // drawImage(bitmap, x, y, w, h, 0, 0, w, h) puts the area (x, y) of the frame at the canvas origin;
    // getImageData then reads that area of the picture.
    drawImage = vi.fn((_source: unknown, x: number, y: number) => void (origin = { x, y }));
    getImageData = vi.fn((_x: number, _y: number, width: number, height: number) => {
      const data = new Uint8ClampedArray(width * height * 4).fill(255);
      for (let row = 0; row < height; row++) {
        const sourceRow = origin.y + row;
        if (sourceRow < 0 || sourceRow >= current.height) continue;
        const from = (sourceRow * current.width + origin.x) * 4;
        const length = Math.min(width, current.width - origin.x) * 4;
        if (length > 0) data.set(current.data.subarray(from, from + length), row * width * 4);
      }
      return { data, width, height };
    });
    vi.stubGlobal(
      'OffscreenCanvas',
      class {
        public width: number;
        public height: number;
        constructor(width: number, height: number) {
          this.width = width;
          this.height = height;
        }
        public getContext() {
          return { drawImage, getImageData };
        }
      },
    );
  });

  afterEach(() => vi.unstubAllGlobals());

  const sorted = (found: Uint8Array[]) => found.map((bytes) => Array.from(bytes)).sort();

  it('reads the QR in the whole frame when no area is given', () => {
    const found = new QrFrameReader().read(bitmap(), []);

    expect(found).toEqual([PAYLOAD]);
    expect(getImageData).toHaveBeenCalledTimes(1);
  });

  it('reads only the given area when it holds the QR, not the whole frame', () => {
    show(OTHER, PAYLOAD);

    const found = new QrFrameReader().read(bitmap(), [
      { x: SIDE + GAP, y: 0, width: SIDE, height: SIDE },
    ]);

    expect(found).toEqual([PAYLOAD]);
    expect(getImageData).toHaveBeenCalledTimes(1);
    expect(drawImage).toHaveBeenCalledWith(
      expect.anything(),
      SIDE + GAP,
      0,
      SIDE,
      SIDE,
      0,
      0,
      SIDE,
      SIDE,
    );
  });

  it('reads two QR codes, one from each given area, without searching the whole frame', () => {
    show(PAYLOAD, OTHER);

    const found = new QrFrameReader().read(bitmap(), [
      { x: 0, y: 0, width: SIDE, height: SIDE },
      { x: SIDE + GAP, y: 0, width: SIDE, height: SIDE },
    ]);

    expect(sorted(found)).toEqual(sorted([PAYLOAD, OTHER]));
    expect(getImageData).toHaveBeenCalledTimes(2);
  });

  it('returns only the ones that could be read, without falling back to the whole frame', () => {
    show(PAYLOAD, OTHER);

    const found = new QrFrameReader().read(bitmap(), [
      { x: 0, y: 0, width: SIDE, height: SIDE },
      { x: SIDE + GAP, y: 0, width: 20, height: 20 },
    ]);

    expect(found).toEqual([PAYLOAD]);
    expect(getImageData).toHaveBeenCalledTimes(2);
  });

  describe('when jsQR cannot read two QR codes at once (no area known)', () => {
    it('splits the frame at the empty band between them and reads each side apart', () => {
      show(PAYLOAD, OTHER);

      const found = new QrFrameReader().read(bitmap(), []);

      expect(sorted(found)).toEqual(sorted([PAYLOAD, OTHER]));
    });

    it('does so after the areas the detector gave turned out empty too', () => {
      show(PAYLOAD, OTHER);

      const found = new QrFrameReader().read(bitmap(), [
        { x: 0, y: 140, width: 5, height: 5 },
        { x: 10, y: 140, width: 5, height: 5 },
      ]);

      expect(sorted(found)).toEqual(sorted([PAYLOAD, OTHER]));
    });

    it('follows the band wherever it is: the two codes need not be centred in the frame', () => {
      // A wide gap and a narrow one around, with the pair far from the centre of the frame.
      const left = qrPixels(PAYLOAD);
      const right = qrPixels(OTHER);
      const width = 3 * SIDE + 150;
      const data = new Uint8ClampedArray(width * SIDE * 4).fill(255);
      for (let row = 0; row < SIDE; row++) {
        data.set(left.subarray(row * SIDE * 4, (row + 1) * SIDE * 4), (row * width + 10) * 4);
        data.set(
          right.subarray(row * SIDE * 4, (row + 1) * SIDE * 4),
          (row * width + SIDE + 40) * 4,
        );
      }
      current = { data, width, height: SIDE };

      const found = new QrFrameReader().read(bitmap(), []);

      expect(sorted(found)).toEqual(sorted([PAYLOAD, OTHER]));
    });

    it('reads both when jsQR manages to read the bigger one alone: it masks it and looks for the other', () => {
      // A big QR and a small one: jsQR reads the big one even with the small one in the frame.
      const big = Uint8Array.from({ length: 300 }, (_, i) => (i * 29 + 3) & 0xff);
      const wide = qrPixelsSized(big, 3);
      const little = qrPixelsSized(OTHER, 3);
      const width = wide.side + 40 + little.side;
      const data = new Uint8ClampedArray(width * wide.side * 4).fill(255);
      for (let row = 0; row < wide.side; row++) {
        data.set(
          wide.pixels.subarray(row * wide.side * 4, (row + 1) * wide.side * 4),
          row * width * 4,
        );
      }
      for (let row = 0; row < little.side; row++) {
        data.set(
          little.pixels.subarray(row * little.side * 4, (row + 1) * little.side * 4),
          (row * width + wide.side + 40) * 4,
        );
      }
      current = { data, width, height: wide.side };

      const found = new QrFrameReader().read(bitmap(), []);

      expect(sorted(found)).toEqual(sorted([big, OTHER]));
    });

    it('does not split a frame that has no empty band between two groups of dark columns', () => {
      show(PAYLOAD);
      // The only QR plus an empty margin: there is a band but nothing dark on one side of it.
      const data = new Uint8ClampedArray(2 * SIDE * 4 * SIDE).fill(255);
      current = { data, width: 2 * SIDE, height: SIDE };

      expect(new QrFrameReader().read(bitmap(), [])).toEqual([]);
      expect(getImageData).toHaveBeenCalledTimes(1);
    });

    it('does not read crops at all when a QR was read from the whole frame', () => {
      show(PAYLOAD);

      new QrFrameReader().read(bitmap(), []);

      expect(getImageData).toHaveBeenCalledTimes(1);
    });
  });

  describe('where the QR codes were read', () => {
    it('gives the box of a QR read from the whole frame', () => {
      const reader = new QrFrameReader();

      reader.read(bitmap(), []);

      expect(reader.lastBoxes).toHaveLength(1);
      const [box] = reader.lastBoxes;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(SIDE);
      expect(box.y + box.height).toBeLessThanOrEqual(SIDE);
      expect(box.width).toBeGreaterThan(SIDE / 2);
      expect(box.height).toBeGreaterThan(SIDE / 2);
    });

    it('gives a box in frame coordinates for a QR read from a given area', () => {
      show(OTHER, PAYLOAD);
      const reader = new QrFrameReader();

      reader.read(bitmap(), [{ x: SIDE + GAP, y: 0, width: SIDE, height: SIDE }]);

      expect(reader.lastBoxes).toHaveLength(1);
      const [box] = reader.lastBoxes;
      expect(box.x).toBeGreaterThanOrEqual(SIDE + GAP);
      expect(box.x + box.width).toBeLessThanOrEqual(2 * SIDE + GAP);
    });

    it('gives one box per QR when two are read', () => {
      show(OTHER, PAYLOAD);
      const reader = new QrFrameReader();

      reader.read(bitmap(), []);

      expect(reader.lastBoxes).toHaveLength(2);
      expect(reader.lastBoxes.map((box) => box.x < SIDE).sort()).toEqual([false, true]);
    });

    it('forgets the boxes of the previous frame', () => {
      const reader = new QrFrameReader();
      reader.read(bitmap(), []);

      current = {
        data: new Uint8ClampedArray(SIDE * SIDE * 4).fill(255),
        width: SIDE,
        height: SIDE,
      };
      reader.read(bitmap(), []);

      expect(reader.lastBoxes).toEqual([]);
    });
  });

  it('returns nothing when there is no QR anywhere', () => {
    current = {
      data: new Uint8ClampedArray(current.width * SIDE * 4).fill(255),
      width: current.width,
      height: SIDE,
    };

    expect(new QrFrameReader().read(bitmap(), [])).toEqual([]);
  });

  it('returns nothing without reading pixels when there is no 2d context', () => {
    vi.stubGlobal(
      'OffscreenCanvas',
      class {
        public width = 0;
        public height = 0;
        public getContext() {
          return null;
        }
      },
    );

    expect(new QrFrameReader().read(bitmap(), [])).toEqual([]);
  });
});

describe('regionAround', () => {
  const frame = { width: 400, height: 400 };

  it('adds a 25 % margin on each side', () => {
    expect(regionAround({ x: 100, y: 100, width: 100, height: 100 }, frame)).toEqual({
      x: 75,
      y: 75,
      width: 150,
      height: 150,
    });
  });

  it('keeps the area inside the frame when the QR is at its edge', () => {
    expect(regionAround({ x: 0, y: 300, width: 100, height: 100 }, frame)).toEqual({
      x: 0,
      y: 275,
      width: 125,
      height: 125,
    });
  });

  it('gives no area when there is no box or it is empty', () => {
    expect(regionAround(undefined, frame)).toBeNull();
    expect(regionAround({ x: 10, y: 10, width: 0, height: 20 }, frame)).toBeNull();
  });
});
