import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { QrDecoder } from '@/features/receive/services/qr-decoder';
import { QrFrameReader, QrRegion } from '@/features/receive/services/qr-frame-reader';
import { ReceiveDiagnostics } from '@/features/receive/services/receive-diagnostics';
import type { QrWorkerRequest } from '@/features/receive/services/qr.worker';

const video = { videoWidth: 640, videoHeight: 480 } as HTMLVideoElement;

/** Stands in for the reading worker: records what it is sent and lets the test answer. */
class FakeWorker {
  public static instances: FakeWorker[] = [];
  public readonly sent: QrWorkerRequest[] = [];
  public readonly transferred: Transferable[][] = [];
  public terminated = false;
  private readonly listeners = new Map<string, ((event: never) => void)[]>();

  constructor() {
    FakeWorker.instances.push(this);
  }

  public addEventListener(type: string, listener: (event: never) => void): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener]);
  }

  public postMessage(request: QrWorkerRequest, transfer: Transferable[]): void {
    this.sent.push(request);
    this.transferred.push(transfer);
  }

  public terminate(): void {
    this.terminated = true;
  }

  public emit(type: string, event: unknown): void {
    (this.listeners.get(type) ?? []).forEach((listener) => listener(event as never));
  }
}

describe('QrDecoder', () => {
  let close: ReturnType<typeof vi.fn>;
  let createImageBitmap: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    close = vi.fn();
    createImageBitmap = vi.fn(async () => ({ close, width: 640, height: 480 }));
    vi.stubGlobal('createImageBitmap', createImageBitmap);
    vi.stubGlobal('BarcodeDetector', undefined);
    FakeWorker.instances = [];
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  const stubDetector = (codes: object[] | Error) => {
    const detect =
      codes instanceof Error ? vi.fn().mockRejectedValue(codes) : vi.fn().mockResolvedValue(codes);
    vi.stubGlobal(
      'BarcodeDetector',
      class {
        public detect = detect;
      },
    );
    return detect;
  };

  const readPixels = (bytes: Uint8Array | null) =>
    vi.spyOn(QrFrameReader.prototype, 'read').mockResolvedValue(bytes ? [bytes] : []);

  const diagnostics = () => TestBed.inject(ReceiveDiagnostics).state();

  it('returns null without capturing anything while the camera has no frame yet', async () => {
    const bytes = await TestBed.inject(QrDecoder).decode({
      videoWidth: 0,
      videoHeight: 0,
    } as HTMLVideoElement);

    expect(bytes).toEqual([]);
    expect(createImageBitmap).not.toHaveBeenCalled();
  });

  describe('where workers are not available', () => {
    it('reads the whole frame with ZXing when there is no native detector', async () => {
      const read = readPixels(Uint8Array.of(1, 2, 3));

      const bytes = await TestBed.inject(QrDecoder).decode(video);

      expect(bytes).toEqual([Uint8Array.of(1, 2, 3)]);
      expect(read).toHaveBeenCalledWith(expect.anything(), []);
      expect(close).toHaveBeenCalledTimes(1);
      expect(diagnostics()).toMatchObject({ reader: 'page', nativeDetector: false });
    });

    it('reads no pixels when the detector sees no QR, and releases the capture', async () => {
      stubDetector([]);
      const read = readPixels(null);

      const bytes = await TestBed.inject(QrDecoder).decode(video);

      expect(bytes).toEqual([]);
      expect(read).not.toHaveBeenCalled();
      expect(close).toHaveBeenCalledTimes(1);
      expect(diagnostics()).toMatchObject({ nativeDetector: true, detected: 0 });
    });

    it('reads the area around the QR the detector located', async () => {
      stubDetector([{ rawValue: '', boundingBox: { x: 100, y: 100, width: 100, height: 100 } }]);
      const read = readPixels(Uint8Array.of(5));

      const bytes = await TestBed.inject(QrDecoder).decode(video);

      expect(bytes).toEqual([Uint8Array.of(5)]);
      expect(read).toHaveBeenCalledWith(expect.anything(), [
        { x: 75, y: 75, width: 150, height: 150 } satisfies QrRegion,
      ]);
      expect(diagnostics()).toMatchObject({ detected: 1, read: 1, lastLength: 1 });
    });

    it('takes the detector text as latin1 when ZXing cannot read the frame', async () => {
      stubDetector([{ rawValue: 'AÿB' }]);
      readPixels(null);

      const bytes = await TestBed.inject(QrDecoder).decode(video);

      expect(bytes).toEqual([Uint8Array.of(0x41, 0xff, 0x42)]);
    });

    it('detects without bytes when ZXing fails and the detector text is empty', async () => {
      stubDetector([{ rawValue: '' }]);
      readPixels(null);

      const bytes = await TestBed.inject(QrDecoder).decode(video);

      expect(bytes).toEqual([]);
      expect(diagnostics()).toMatchObject({ detected: 1, read: 0 });
    });

    it('stops using a detector that keeps failing and reads with ZXing alone', async () => {
      const detect = stubDetector(
        Object.assign(new Error('unavailable'), { name: 'InvalidStateError' }),
      );
      readPixels(Uint8Array.of(1));
      const decoder = TestBed.inject(QrDecoder);

      for (let frame = 0; frame < 6; frame++) {
        await decoder.decode(video);
      }

      expect(detect).toHaveBeenCalledTimes(3);
      expect(diagnostics()).toMatchObject({ nativeDetector: false, read: 6 });
    });

    it('keeps using a detector that fails only now and then', async () => {
      const detect = vi
        .fn()
        .mockRejectedValueOnce(new Error('x'))
        .mockRejectedValueOnce(new Error('x'))
        .mockResolvedValueOnce([])
        .mockRejectedValueOnce(new Error('x'))
        .mockRejectedValueOnce(new Error('x'))
        .mockResolvedValue([]);
      vi.stubGlobal(
        'BarcodeDetector',
        class {
          public detect = detect;
        },
      );
      readPixels(null);
      const decoder = TestBed.inject(QrDecoder);

      for (let frame = 0; frame < 6; frame++) {
        await decoder.decode(video);
      }

      expect(detect).toHaveBeenCalledTimes(6);
    });

    it('does not use the native detector when it cannot read QR codes', async () => {
      const detect = vi.fn().mockResolvedValue([]);
      vi.stubGlobal(
        'BarcodeDetector',
        class {
          public static getSupportedFormats = vi.fn().mockResolvedValue(['code_128']);
          public detect = detect;
        },
      );
      readPixels(Uint8Array.of(5));

      const bytes = await TestBed.inject(QrDecoder).decode(video);

      expect(detect).not.toHaveBeenCalled();
      expect(bytes).toEqual([Uint8Array.of(5)]);
      expect(diagnostics()).toMatchObject({ nativeDetector: false, lastError: null });
    });

    it('uses the native detector when it lists QR codes among its formats', async () => {
      const detect = vi.fn().mockResolvedValue([]);
      vi.stubGlobal(
        'BarcodeDetector',
        class {
          public static getSupportedFormats = vi.fn().mockResolvedValue(['qr_code', 'ean_13']);
          public detect = detect;
        },
      );
      readPixels(null);

      await TestBed.inject(QrDecoder).decode(video);

      expect(detect).toHaveBeenCalledTimes(1);
      expect(diagnostics()).toMatchObject({ nativeDetector: true });
    });

    it('drops the detector at once when its service is unavailable, without reporting an error', async () => {
      const detect = stubDetector(
        Object.assign(new Error('Barcode detection service unavailable.'), {
          name: 'NotSupportedError',
        }),
      );
      readPixels(Uint8Array.of(5));
      const decoder = TestBed.inject(QrDecoder);

      await decoder.decode(video);
      await decoder.decode(video);

      expect(detect).toHaveBeenCalledTimes(1);
      expect(diagnostics()).toMatchObject({ nativeDetector: false, lastError: null, read: 2 });
    });

    it('records the formats the browser says its detector reads', async () => {
      vi.stubGlobal(
        'BarcodeDetector',
        class {
          public static getSupportedFormats = vi.fn().mockResolvedValue(['qr_code', 'ean_13']);
          public detect = vi.fn().mockResolvedValue([]);
        },
      );
      readPixels(null);

      await TestBed.inject(QrDecoder).decode(video);

      expect(diagnostics().formats).toBe('qr_code, ean_13');
    });

    it('records that the browser lists no formats at all', async () => {
      vi.stubGlobal(
        'BarcodeDetector',
        class {
          public static getSupportedFormats = vi.fn().mockResolvedValue([]);
          public detect = vi.fn();
        },
      );
      readPixels(Uint8Array.of(1));

      await TestBed.inject(QrDecoder).decode(video);

      expect(diagnostics().formats).toBe('ninguno');
    });

    it('records why the browser could not list the formats', async () => {
      vi.stubGlobal(
        'BarcodeDetector',
        class {
          public static getSupportedFormats = vi
            .fn()
            .mockRejectedValue(
              Object.assign(new Error('sin servicio'), { name: 'NotSupportedError' }),
            );
          public detect = vi.fn().mockResolvedValue([]);
        },
      );
      readPixels(null);

      await TestBed.inject(QrDecoder).decode(video);

      expect(diagnostics().formats).toBe('error NotSupportedError: sin servicio');
    });

    it('records that the browser has no way to list the formats', async () => {
      stubDetector([]);
      readPixels(null);

      await TestBed.inject(QrDecoder).decode(video);

      expect(diagnostics().formats).toBe('no lo informa');
    });

    it('reads the whole frame and records the cause when the detector throws', async () => {
      stubDetector(Object.assign(new Error('invalid state'), { name: 'InvalidStateError' }));
      const read = readPixels(Uint8Array.of(9, 8));

      const bytes = await TestBed.inject(QrDecoder).decode(video);

      expect(bytes).toEqual([Uint8Array.of(9, 8)]);
      expect(read).toHaveBeenCalledWith(expect.anything(), []);
      expect(diagnostics().lastError).toContain('InvalidStateError');
    });

    it('releases the capture even when reading fails, and records the failure', async () => {
      vi.spyOn(QrFrameReader.prototype, 'read').mockRejectedValue(new Error('boom'));

      await expect(TestBed.inject(QrDecoder).decode(video)).rejects.toThrow('boom');

      expect(close).toHaveBeenCalledTimes(1);
      expect(diagnostics().lastError).toContain('boom');
    });

    it('records the frame, its size and the time spent', async () => {
      readPixels(null);

      await TestBed.inject(QrDecoder).decode(video);

      expect(diagnostics()).toMatchObject({ frames: 1, videoSize: '640×480' });
      expect(diagnostics().averageMs).not.toBeNull();
    });
  });

  describe('with several QR codes in the same frame', () => {
    const box = (x: number) => ({ x, y: 100, width: 100, height: 100 });

    it('takes only the first QR the detector located', async () => {
      stubDetector([
        { rawValue: '', boundingBox: box(50) },
        { rawValue: '', boundingBox: box(400) },
      ]);
      const read = readPixels(Uint8Array.of(1));

      await TestBed.inject(QrDecoder).decode(video);

      expect(read).toHaveBeenCalledWith(expect.anything(), [
        { x: 25, y: 75, width: 150, height: 150 },
      ]);
    });
  });

  describe('when the browser cannot capture a bitmap', () => {
    let drawImage: ReturnType<typeof vi.fn>;
    let canvas: {
      width: number;
      height: number;
      getContext: () => { drawImage: typeof drawImage };
    };

    beforeEach(() => {
      createImageBitmap.mockRejectedValue(
        Object.assign(new Error('The ImageBitmap could not be allocated.'), {
          name: 'InvalidStateError',
        }),
      );
      drawImage = vi.fn();
      canvas = { width: 0, height: 0, getContext: () => ({ drawImage }) };
      vi.spyOn(document, 'createElement').mockReturnValue(canvas as unknown as HTMLElement);
      vi.stubGlobal('Worker', FakeWorker);
      vi.stubGlobal('OffscreenCanvas', class {});
    });

    it('draws the frame on a canvas, reads it in the page and keeps the cause', async () => {
      const read = readPixels(Uint8Array.of(3, 3));

      const bytes = await TestBed.inject(QrDecoder).decode(video);

      expect(bytes).toEqual([Uint8Array.of(3, 3)]);
      expect(drawImage).toHaveBeenCalledWith(video, 0, 0, 640, 480);
      expect(read).toHaveBeenCalledWith(canvas, []);
      expect(FakeWorker.instances.every((worker) => worker.sent.length === 0)).toBe(true);
      expect(diagnostics()).toMatchObject({ reader: 'page' });
      expect(diagnostics().lastError).toContain('could not be allocated');
    });

    it('reduces a large frame so its longest side is at most 1280 px', async () => {
      readPixels(null);
      const portrait = { videoWidth: 1080, videoHeight: 1920 } as HTMLVideoElement;

      await TestBed.inject(QrDecoder).decode(portrait);

      expect(canvas.width).toBe(720);
      expect(canvas.height).toBe(1280);
    });

    it('passes the canvas to the native detector and reads the area it locates', async () => {
      const detect = stubDetector([
        { rawValue: '', boundingBox: { x: 100, y: 100, width: 100, height: 100 } },
      ]);
      const read = readPixels(Uint8Array.of(6));

      await TestBed.inject(QrDecoder).decode(video);

      expect(detect).toHaveBeenCalledWith(canvas);
      expect(read).toHaveBeenCalledWith(canvas, [{ x: 75, y: 75, width: 150, height: 150 }]);
    });

    it('does not try to capture a bitmap again after it failed', async () => {
      readPixels(null);
      const decoder = TestBed.inject(QrDecoder);

      await decoder.decode(video);
      await decoder.decode(video);

      expect(createImageBitmap).toHaveBeenCalledTimes(1);
    });
  });

  describe('preparing the reading', () => {
    it('starts the worker ahead of the first frame, so it can load what it needs', () => {
      vi.stubGlobal('Worker', FakeWorker);
      vi.stubGlobal('OffscreenCanvas', class {});

      TestBed.inject(QrDecoder).prepare();

      expect(FakeWorker.instances).toHaveLength(1);
    });

    it('loads the reader of the page when there is no worker', () => {
      const warmUp = vi.spyOn(QrFrameReader.prototype, 'warmUp').mockResolvedValue();

      TestBed.inject(QrDecoder).prepare();

      expect(warmUp).toHaveBeenCalledTimes(1);
    });
  });

  describe('with a worker', () => {
    beforeEach(() => {
      vi.stubGlobal('Worker', FakeWorker);
      vi.stubGlobal('OffscreenCanvas', class {});
    });

    const answerWhenSent = async (index: number, response: object) => {
      await vi.waitFor(() => expect(FakeWorker.instances[0]?.sent).toHaveLength(index + 1), {
        timeout: 3000,
      });
      const worker = FakeWorker.instances[0];
      worker.emit('message', {
        data: { id: worker.sent[index].id, error: null, boxes: [], ...response },
      });
    };

    it('locates the QR in the page and sends the area to the worker with the transferred frame', async () => {
      stubDetector([{ rawValue: '', boundingBox: { x: 100, y: 100, width: 100, height: 100 } }]);
      const decoder = TestBed.inject(QrDecoder);

      const pending = decoder.decode(video);
      await answerWhenSent(0, { bytes: [Uint8Array.of(7)] });

      expect(await pending).toEqual([Uint8Array.of(7)]);
      const worker = FakeWorker.instances[0];
      expect(worker.sent[0].regions).toEqual([{ x: 75, y: 75, width: 150, height: 150 }]);
      expect(worker.transferred[0]).toEqual([worker.sent[0].bitmap]);
      expect(close).not.toHaveBeenCalled();
      expect(diagnostics()).toMatchObject({ reader: 'worker', nativeDetector: true });
    });

    it('sends nothing to the worker when the detector sees no QR', async () => {
      stubDetector([]);

      const bytes = await TestBed.inject(QrDecoder).decode(video);

      expect(bytes).toEqual([]);
      expect(FakeWorker.instances[0].sent).toHaveLength(0);
      expect(close).toHaveBeenCalledTimes(1);
    });

    it('sends the whole frame to the worker when there is no native detector', async () => {
      const decoder = TestBed.inject(QrDecoder);

      const pending = decoder.decode(video);
      await answerWhenSent(0, { bytes: [] });
      await pending;

      expect(FakeWorker.instances[0].sent[0].regions).toEqual([]);
    });

    it('creates one worker and reuses it for every frame', async () => {
      const decoder = TestBed.inject(QrDecoder);
      for (let frame = 0; frame < 2; frame++) {
        const pending = decoder.decode(video);
        await answerWhenSent(frame, { bytes: [] });
        await pending;
      }

      expect(FakeWorker.instances).toHaveLength(1);
    });

    it('ignores an answer that belongs to an older request', async () => {
      const decoder = TestBed.inject(QrDecoder);

      const pending = decoder.decode(video);
      await vi.waitFor(() => expect(FakeWorker.instances[0]?.sent).toHaveLength(1), {
        timeout: 3000,
      });
      const worker = FakeWorker.instances[0];
      worker.emit('message', {
        data: { id: 999, bytes: [Uint8Array.of(1)], boxes: [], error: null },
      });
      worker.emit('message', {
        data: { id: worker.sent[0].id, bytes: [], boxes: [], error: null },
      });

      expect(await pending).toEqual([]);
    });

    it('gives up on a worker that fails and reads the next frames in the page', async () => {
      const decoder = TestBed.inject(QrDecoder);
      const pending = decoder.decode(video);
      const failed = expect(pending).rejects.toThrow('falló');
      await vi.waitFor(() => expect(FakeWorker.instances[0]?.sent).toHaveLength(1), {
        timeout: 3000,
      });

      FakeWorker.instances[0].emit('error', { message: 'script error' });

      await failed;
      expect(FakeWorker.instances[0].terminated).toBe(true);
      readPixels(Uint8Array.of(4));
      expect(await decoder.decode(video)).toEqual([Uint8Array.of(4)]);
      expect(FakeWorker.instances).toHaveLength(1);
    });
  });

  describe('where the QR codes are', () => {
    const box = { x: 100, y: 120, width: 90, height: 80 };

    it('exposes the box of the QR the detector located, with the frame size', async () => {
      stubDetector([{ rawValue: '', boundingBox: box }]);
      readPixels(Uint8Array.of(5));
      const decoder = TestBed.inject(QrDecoder);

      await decoder.decode(video);

      expect(decoder.location()).toEqual({ boxes: [box], width: 640, height: 480 });
    });

    it('has no box from the detector when the QR came without one', async () => {
      stubDetector([{ rawValue: 'A' }]);
      readPixels(Uint8Array.of(5));
      const decoder = TestBed.inject(QrDecoder);

      await decoder.decode(video);

      expect(decoder.location()).toBeNull();
    });

    it('keeps the box for a moment when a frame finds nothing, so it does not flicker', async () => {
      let now = 1000;
      vi.spyOn(performance, 'now').mockImplementation(() => now);
      const detect = stubDetector([{ rawValue: '', boundingBox: box }]);
      readPixels(Uint8Array.of(5));
      const decoder = TestBed.inject(QrDecoder);
      await decoder.decode(video);
      detect.mockResolvedValue([]);

      now += 200;
      await decoder.decode(video);

      expect(decoder.location()?.boxes).toEqual([box]);
    });

    it('forgets the location once the QR has been gone for longer than that', async () => {
      let now = 1000;
      vi.spyOn(performance, 'now').mockImplementation(() => now);
      const detect = stubDetector([{ rawValue: '', boundingBox: box }]);
      readPixels(Uint8Array.of(5));
      const decoder = TestBed.inject(QrDecoder);
      await decoder.decode(video);
      detect.mockResolvedValue([]);

      now += 600;
      await decoder.decode(video);

      expect(decoder.location()).toBeNull();
    });

    it('forgets the location with clearLocation', async () => {
      stubDetector([{ rawValue: '', boundingBox: box }]);
      readPixels(Uint8Array.of(5));
      const decoder = TestBed.inject(QrDecoder);
      await decoder.decode(video);

      decoder.clearLocation();

      expect(decoder.location()).toBeNull();
    });
  });

  describe('where ZXing found the QR codes', () => {
    it('exposes the boxes the worker found when there is no native detector', async () => {
      vi.stubGlobal('Worker', FakeWorker);
      vi.stubGlobal('OffscreenCanvas', class {});
      const decoder = TestBed.inject(QrDecoder);
      const box = { x: 40, y: 50, width: 120, height: 110 };

      const pending = decoder.decode(video);
      await vi.waitFor(() => expect(FakeWorker.instances[0]?.sent).toHaveLength(1), {
        timeout: 3000,
      });
      const worker = FakeWorker.instances[0];
      worker.emit('message', {
        data: { id: worker.sent[0].id, bytes: [Uint8Array.of(1)], boxes: [box], error: null },
      });
      await pending;

      expect(decoder.location()).toEqual({ boxes: [box], width: 640, height: 480 });
    });

    it('exposes the boxes found when the page reads the frame itself', async () => {
      const box = { x: 5, y: 6, width: 70, height: 80 };
      readPixels(Uint8Array.of(5));
      vi.spyOn(QrFrameReader.prototype, 'lastBoxes', 'get').mockReturnValue([box]);
      const decoder = TestBed.inject(QrDecoder);

      await decoder.decode(video);

      expect(decoder.location()).toEqual({ boxes: [box], width: 640, height: 480 });
    });

    it('prefers the boxes of the native detector when it gave them', async () => {
      const detected = { x: 100, y: 120, width: 90, height: 80 };
      stubDetector([{ rawValue: '', boundingBox: detected }]);
      readPixels(Uint8Array.of(5));
      vi.spyOn(QrFrameReader.prototype, 'lastBoxes', 'get').mockReturnValue([
        { x: 1, y: 1, width: 1, height: 1 },
      ]);
      const decoder = TestBed.inject(QrDecoder);

      await decoder.decode(video);

      expect(decoder.location()?.boxes).toEqual([detected]);
    });

    it('has no location when the frame holds no readable QR', async () => {
      readPixels(null);
      const decoder = TestBed.inject(QrDecoder);

      await decoder.decode(video);

      expect(decoder.location()).toBeNull();
    });
  });
});
