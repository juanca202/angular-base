import { readFileSync } from 'node:fs';
import { create } from 'qrcode';
import type { ZXingModuleOverrides } from 'zxing-wasm/reader';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { QrFrameReader } from '@/features/receive/services/qr-frame-reader';

/** Side of one QR in the test picture, in pixels. */
const SIDE = 150;
/** Gap between the two QR codes of the wide picture. */
const GAP = 30;
const PAYLOAD = Uint8Array.from({ length: 40 }, (_, i) => (i * 37 + 11) & 0xff);

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

/** ZXing gets its `.wasm` from disk: there is no web server in the unit tests. */
const TEST_WASM: ZXingModuleOverrides = {
  instantiateWasm: (
    imports: WebAssembly.Imports,
    receiveInstance: (instance: WebAssembly.Instance) => void,
  ) => {
    const bytes = readFileSync('node_modules/zxing-wasm/dist/reader/zxing_reader.wasm');
    void WebAssembly.instantiate(bytes, imports).then(({ instance }) => receiveInstance(instance));
    return {};
  },
};

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

  it('loads the ZXing module ahead of the first frame with warmUp', async () => {
    await expect(new QrFrameReader(TEST_WASM).warmUp()).resolves.toBeUndefined();
  });

  it('reads the QR of the frame', async () => {
    const found = await new QrFrameReader(TEST_WASM).read(bitmap());

    expect(found).toEqual([PAYLOAD]);
    expect(getImageData).toHaveBeenCalledTimes(1);
  });

  describe('where the QR was read', () => {
    it('gives the box of a QR read from the whole frame', async () => {
      const reader = new QrFrameReader(TEST_WASM);

      await reader.read(bitmap());

      expect(reader.lastBoxes).toHaveLength(1);
      const [box] = reader.lastBoxes;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(SIDE);
      expect(box.y + box.height).toBeLessThanOrEqual(SIDE);
      expect(box.width).toBeGreaterThan(SIDE / 2);
      expect(box.height).toBeGreaterThan(SIDE / 2);
    });

    it('forgets the boxes of the previous frame', async () => {
      const reader = new QrFrameReader(TEST_WASM);
      await reader.read(bitmap());

      current = {
        data: new Uint8ClampedArray(SIDE * SIDE * 4).fill(255),
        width: SIDE,
        height: SIDE,
      };
      await reader.read(bitmap());

      expect(reader.lastBoxes).toEqual([]);
    });
  });

  it('returns nothing when there is no QR anywhere', async () => {
    current = {
      data: new Uint8ClampedArray(current.width * SIDE * 4).fill(255),
      width: current.width,
      height: SIDE,
    };

    expect(await new QrFrameReader(TEST_WASM).read(bitmap())).toEqual([]);
  });

  it('returns nothing without reading pixels when there is no 2d context', async () => {
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

    expect(await new QrFrameReader(TEST_WASM).read(bitmap())).toEqual([]);
  });
});
