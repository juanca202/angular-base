import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { QrDecoder } from '@/features/receive/services/qr-decoder';
import { QrFrameReader } from '@/features/receive/services/qr-frame-reader';
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
    FakeWorker.instances = [];
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  const readPixels = (bytes: Uint8Array | null) =>
    vi.spyOn(QrFrameReader.prototype, 'read').mockResolvedValue(bytes ? [bytes] : []);

  const diagnostics = () => TestBed.inject(ReceiveDiagnostics).state();

  it('returns nothing without capturing anything while the camera has no frame yet', async () => {
    const bytes = await TestBed.inject(QrDecoder).decode({
      videoWidth: 0,
      videoHeight: 0,
    } as HTMLVideoElement);

    expect(bytes).toEqual([]);
    expect(createImageBitmap).not.toHaveBeenCalled();
  });

  describe('where workers are not available', () => {
    it('reads the whole frame with ZXing and releases the capture', async () => {
      const read = readPixels(Uint8Array.of(1, 2, 3));

      const bytes = await TestBed.inject(QrDecoder).decode(video);

      expect(bytes).toEqual([Uint8Array.of(1, 2, 3)]);
      expect(read).toHaveBeenCalledWith(expect.anything());
      expect(close).toHaveBeenCalledTimes(1);
      expect(diagnostics()).toMatchObject({ reader: 'page', detected: 1, read: 1, lastLength: 3 });
    });

    it('returns nothing and counts no QR when the frame holds none', async () => {
      readPixels(null);

      const bytes = await TestBed.inject(QrDecoder).decode(video);

      expect(bytes).toEqual([]);
      expect(diagnostics()).toMatchObject({ detected: 0, read: 0 });
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

  describe('when the browser cannot capture a bitmap', () => {
    let drawImage: ReturnType<typeof vi.fn>;
    let canvas: {
      width: number;
      height: number;
      getContext: () => { drawImage: ReturnType<typeof vi.fn> };
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
      expect(read).toHaveBeenCalledWith(canvas);
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

    it('sends the whole frame to the worker, transferred', async () => {
      const decoder = TestBed.inject(QrDecoder);

      const pending = decoder.decode(video);
      await answerWhenSent(0, { bytes: [Uint8Array.of(7)] });

      expect(await pending).toEqual([Uint8Array.of(7)]);
      const worker = FakeWorker.instances[0];
      expect(worker.transferred[0]).toEqual([worker.sent[0].bitmap]);
      expect(close).not.toHaveBeenCalled();
      expect(diagnostics()).toMatchObject({ reader: 'worker', read: 1 });
    });

    it('keeps the cause the worker reports', async () => {
      const decoder = TestBed.inject(QrDecoder);

      const pending = decoder.decode(video);
      await answerWhenSent(0, { bytes: [], error: 'RuntimeError: wasm' });
      await pending;

      expect(diagnostics().lastError).toBe('RuntimeError: wasm');
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

  describe('where the QR is', () => {
    const box = { x: 100, y: 120, width: 90, height: 80 };
    const found = () =>
      vi.spyOn(QrFrameReader.prototype, 'lastBoxes', 'get').mockReturnValue([box]);

    it('exposes the box ZXing found in the page, with the frame size', async () => {
      readPixels(Uint8Array.of(5));
      found();
      const decoder = TestBed.inject(QrDecoder);

      await decoder.decode(video);

      expect(decoder.location()).toEqual({ boxes: [box], width: 640, height: 480 });
    });

    it('exposes the box the worker found', async () => {
      vi.stubGlobal('Worker', FakeWorker);
      vi.stubGlobal('OffscreenCanvas', class {});
      const decoder = TestBed.inject(QrDecoder);

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

    it('has no location when the frame holds no readable QR', async () => {
      readPixels(null);
      const decoder = TestBed.inject(QrDecoder);

      await decoder.decode(video);

      expect(decoder.location()).toBeNull();
    });

    it('keeps the box for a moment when a frame finds nothing, so it does not flicker', async () => {
      let now = 1000;
      vi.spyOn(performance, 'now').mockImplementation(() => now);
      const read = readPixels(Uint8Array.of(5));
      const boxes = found();
      const decoder = TestBed.inject(QrDecoder);
      await decoder.decode(video);
      read.mockResolvedValue([]);
      boxes.mockReturnValue([]);

      now += 200;
      await decoder.decode(video);

      expect(decoder.location()?.boxes).toEqual([box]);
    });

    it('forgets the location once the QR has been gone for longer than that', async () => {
      let now = 1000;
      vi.spyOn(performance, 'now').mockImplementation(() => now);
      const read = readPixels(Uint8Array.of(5));
      const boxes = found();
      const decoder = TestBed.inject(QrDecoder);
      await decoder.decode(video);
      read.mockResolvedValue([]);
      boxes.mockReturnValue([]);

      now += 600;
      await decoder.decode(video);

      expect(decoder.location()).toBeNull();
    });

    it('forgets the location with clearLocation', async () => {
      readPixels(Uint8Array.of(5));
      found();
      const decoder = TestBed.inject(QrDecoder);
      await decoder.decode(video);

      decoder.clearLocation();

      expect(decoder.location()).toBeNull();
    });
  });
});
