import { Service, inject, signal } from '@angular/core';
import { ReceiveDiagnostics } from '@/features/receive/services/receive-diagnostics';
import { QrFrameReader, QrRegion, QrSource } from '@/features/receive/services/qr-frame-reader';
import type { QrWorkerRequest, QrWorkerResponse } from '@/features/receive/services/qr.worker';

/** Where the QR seen in the last frame is: its box and the size of the frame it refers to. */
export interface QrLocation {
  readonly boxes: readonly QrRegion[];
  readonly width: number;
  readonly height: number;
}

/** Milliseconds the frame stays on screen after the last frame that located a QR, so it does not flicker. */
const LOCATION_HOLD_MS = 400;

/** Longest side, in pixels, of the frame drawn on the canvas when a bitmap cannot be captured. */
const CANVAS_MAX_SIDE = 1280;

/** What reading one frame found. */
interface FrameReading {
  /** The payload of the QR read; empty when none could be read. */
  readonly bytes: readonly Uint8Array[];
  /** Why the reading failed on this frame, if it did. */
  readonly error: string | null;
}

/**
 * Reads the bytes of a QR code from a video element.
 *
 * Each camera frame is captured as an `ImageBitmap` and read with ZXing (WebAssembly), the only
 * reader: in a Web Worker so the page stays free, or in the page itself where workers are not
 * available. ZXing also says where the QR is, so the screen can draw a frame over it.
 */
@Service()
export class QrDecoder {
  private readonly diagnostics = inject(ReceiveDiagnostics);
  private readonly localReader = new QrFrameReader();

  private canvas: HTMLCanvasElement | null = null;
  private readonly _location = signal<QrLocation | null>(null);
  private lastLocatedAt = Number.NEGATIVE_INFINITY;
  private bitmapsFail = false;
  private worker: Worker | null | undefined;
  private nextId = 0;
  private pending: {
    id: number;
    resolve: (response: QrWorkerResponse) => void;
    reject: (error: Error) => void;
  } | null = null;

  /**
   * Where the QR of the last frame is, for drawing a frame over it, or `null` when none was located.
   * It outlives a missed frame for a moment, so the frame does not blink.
   */
  public readonly location = this._location.asReadonly();

  /** Forgets the last location (for example when the reading stops). */
  public clearLocation(): void {
    this.lastLocatedAt = Number.NEGATIVE_INFINITY;
    this._location.set(null);
  }

  /**
   * Gets the reading ready before the first frame: starts the worker (which loads ZXing on its own) or,
   * where there is none, loads ZXing in the page. A failure here is not reported: the first frame
   * tries again and records the cause.
   */
  public prepare(): void {
    if (!this.getWorker()) {
      this.localReader.warmUp().catch(() => undefined);
    }
  }

  /**
   * Decodes the QR visible in the current video frame.
   *
   * @param video - Video element showing the camera stream.
   * @returns The payload bytes of the QR read in the frame; empty when none is found.
   */
  public async decode(video: HTMLVideoElement): Promise<readonly Uint8Array[]> {
    this.diagnostics.frame(video);
    const startedAt = performance.now();
    try {
      if (!video.videoWidth || !video.videoHeight) {
        // The camera has not produced a frame yet: not an error, the next one is tried.
        return [];
      }
      const reading = await this.read(video);
      if (reading.error) {
        this.diagnostics.failed(reading.error);
      }
      if (reading.bytes.length > 0) {
        this.diagnostics.detected(reading.bytes.length);
      }
      reading.bytes.forEach((bytes) => this.diagnostics.read(bytes.length));
      return reading.bytes;
    } catch (error) {
      this.diagnostics.failed(error);
      throw error;
    } finally {
      this.diagnostics.timed(performance.now() - startedAt);
    }
  }

  private async read(video: HTMLVideoElement): Promise<FrameReading> {
    const bitmap = await this.captureBitmap(video);
    // Without a bitmap the frame is drawn on a canvas and read in the page: a canvas cannot be sent.
    const frame: QrSource = bitmap ?? this.drawFrame(video);
    let released = false;
    try {
      const worker = bitmap ? this.getWorker() : null;
      this.diagnostics.mode(worker ? 'worker' : 'page');

      let bytes: readonly Uint8Array[];
      let boxes: readonly QrRegion[];
      let error: string | null = null;
      if (worker && bitmap) {
        // The bitmap is transferred: the worker owns it and releases it after reading.
        released = true;
        const response = await this.ask(worker, bitmap);
        bytes = response.bytes;
        boxes = response.boxes;
        error = response.error;
      } else {
        bytes = await this.localReader.read(frame);
        boxes = this.localReader.lastBoxes;
      }
      this.updateLocation(
        boxes.length > 0
          ? {
              boxes: boxes.map(({ x, y, width, height }) => ({ x, y, width, height })),
              width: video.videoWidth,
              height: video.videoHeight,
            }
          : null,
      );
      return { bytes, error };
    } finally {
      if (!released) {
        bitmap?.close();
      }
    }
  }

  /**
   * Publishes where the QR was seen in this frame. A frame that finds nothing does not clear it right
   * away: the last location is kept for {@link LOCATION_HOLD_MS}, so a QR that is missed for a frame
   * or two does not make the frame blink.
   */
  private updateLocation(location: QrLocation | null): void {
    const now = performance.now();
    if (location) {
      this.lastLocatedAt = now;
      this._location.set(location);
    } else if (now - this.lastLocatedAt >= LOCATION_HOLD_MS) {
      this._location.set(null);
    }
  }

  /**
   * Captures the current frame as a bitmap, or `null` when the browser cannot (for example, it
   * cannot allocate one for a large frame); after a failure bitmaps are not tried again.
   */
  private async captureBitmap(video: HTMLVideoElement): Promise<ImageBitmap | null> {
    if (this.bitmapsFail) {
      return null;
    }
    try {
      return await createImageBitmap(video);
    } catch (error) {
      this.bitmapsFail = true;
      this.diagnostics.failed(error);
      return null;
    }
  }

  /** Draws the current frame on a canvas, reduced so its longest side is at most 1280 px. */
  private drawFrame(video: HTMLVideoElement): HTMLCanvasElement {
    const scale = Math.min(1, CANVAS_MAX_SIDE / Math.max(video.videoWidth, video.videoHeight));
    this.canvas ??= document.createElement('canvas');
    this.canvas.width = Math.round(video.videoWidth * scale);
    this.canvas.height = Math.round(video.videoHeight * scale);
    this.canvas
      .getContext('2d', { willReadFrequently: true })
      ?.drawImage(video, 0, 0, this.canvas.width, this.canvas.height);
    return this.canvas;
  }

  private ask(worker: Worker, bitmap: ImageBitmap) {
    return new Promise<QrWorkerResponse>((resolve, reject) => {
      const id = this.nextId++;
      this.pending = { id, resolve, reject };
      const request: QrWorkerRequest = { id, bitmap };
      worker.postMessage(request, [bitmap]);
    });
  }

  /** The reading worker, or `null` if the browser cannot run it (then the page reads by itself). */
  private getWorker(): Worker | null {
    if (this.worker !== undefined) {
      return this.worker;
    }
    this.worker = null;
    if (typeof Worker === 'undefined' || typeof OffscreenCanvas === 'undefined') {
      return null;
    }
    try {
      const worker = new Worker(new URL('./qr.worker', import.meta.url), { type: 'module' });
      worker.addEventListener('message', ({ data }: MessageEvent<QrWorkerResponse>) => {
        if (this.pending?.id === data.id) {
          const { resolve } = this.pending;
          this.pending = null;
          resolve(data);
        }
      });
      worker.addEventListener('error', (event) => this.dropWorker(worker, event.message));
      this.worker = worker;
    } catch {
      this.worker = null;
    }
    return this.worker;
  }

  /** The worker broke: give up on it so every later frame is read by the page instead. */
  private dropWorker(worker: Worker, message: string): void {
    worker.terminate();
    this.worker = null;
    const pending = this.pending;
    this.pending = null;
    pending?.reject(new Error(`El lector en segundo plano falló: ${message}`));
  }
}
