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

  describe('where the QR was read', () => {
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
