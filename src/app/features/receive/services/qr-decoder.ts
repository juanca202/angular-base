import { Service, inject, signal } from '@angular/core';
import { ReceiveDiagnostics } from '@/features/receive/services/receive-diagnostics';
import {
  QrFrameReader,
  QrRegion,
  QrSource,
  regionAround,
} from '@/features/receive/services/qr-frame-reader';
import type { QrWorkerRequest, QrWorkerResponse } from '@/features/receive/services/qr.worker';

/** A QR spotted by the native detector, with where it is in the frame. */
interface QrDetection {
  rawValue: string;
  boundingBox?: QrRegion;
}

/** Where the QR codes seen in the last frame are: their boxes and the size of the frame they refer to. */
export interface QrLocation {
  readonly boxes: readonly QrRegion[];
  readonly width: number;
  readonly height: number;
}

/** Minimal `BarcodeDetector` shape used here (the API is not yet in the TypeScript DOM lib). */
interface QrDetector {
  detect(source: QrSource): Promise<QrDetection[]>;
}

type QrDetectorConstructor = new (options: { formats: string[] }) => QrDetector;

/** Most QR codes taken from the native detector in one frame (the sender shows at most two). */
const MAX_CODES = 4;

/** Consecutive failures of the native detector after which it is no longer used. */
const DETECTOR_MAX_FAILURES = 3;

/** Longest side, in pixels, of the frame drawn on the canvas when a bitmap cannot be captured. */
const CANVAS_MAX_SIDE = 1280;

/** What reading one frame found. */
interface FrameReading {
  /** How many QR codes were spotted in the frame (by the native detector or by jsQR). */
  readonly detected: number;
  /** The payload of every QR read; empty when none could be read. */
  readonly bytes: readonly Uint8Array[];
  /** Why the native detector or the reading failed on this frame, if it did. */
  readonly error: string | null;
}

/**
 * Reads the bytes of a QR code from a video element.
 *
 * Each camera frame is captured as an `ImageBitmap`. The native `BarcodeDetector` (when the browser
 * has it) runs in the page, where the browser does the work off the main thread, to spot the QR and
 * say where it is; its text is not used for the bytes because it is empty or altered for binary data.
 * The bytes are read with `jsQR` from the area around the QR, in a Web Worker so the page stays free,
 * or in the page itself where workers are not available.
 */
@Service()
export class QrDecoder {
  private readonly diagnostics = inject(ReceiveDiagnostics);
  private readonly localReader = new QrFrameReader();

  private detector: QrDetector | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private readonly _location = signal<QrLocation | null>(null);
  private bitmapsFail = false;
  private detectorFailures = 0;
  private worker: Worker | null | undefined;
  private nextId = 0;
  private pending: {
    id: number;
    resolve: (response: QrWorkerResponse) => void;
    reject: (error: Error) => void;
  } | null = null;

  /**
   * Where the QR codes of the last frame are, for drawing a frame over them, or `null` when none was
   * located. Only the native detector says where a QR is, so without it this stays `null`.
   */
  public readonly location = this._location.asReadonly();

  /** Forgets the last location (for example when the reading stops). */
  public clearLocation(): void {
    this._location.set(null);
  }

  /**
   * Decodes the QR visible in the current video frame.
   *
   * @param video - Video element showing the camera stream.
   * @returns The payload bytes of every QR read in the frame (the sender may show two at once); empty
   * when none is found.
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
      if (reading.detected > 0) {
        this.diagnostics.detected(reading.detected);
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
      // A detector that keeps failing (for example its service is unavailable) is left alone: every
      // failed attempt costs time, and jsQR reads the frame without it.
      const detectorConstructor =
        this.detectorFailures >= DETECTOR_MAX_FAILURES
          ? undefined
          : (globalThis as { BarcodeDetector?: QrDetectorConstructor }).BarcodeDetector;
      if (!detectorConstructor) {
        this._location.set(null);
      }
      const worker = bitmap ? this.getWorker() : null;
      this.diagnostics.mode(worker ? 'worker' : 'page', detectorConstructor !== undefined);

      let hints: QrDetection[] = [];
      let error: string | null = null;
      if (detectorConstructor) {
        try {
          this.detector ??= new detectorConstructor({ formats: ['qr_code'] });
          const codes = await this.detector.detect(frame);
          this.detectorFailures = 0;
          if (codes.length === 0) {
            this._location.set(null);
            return { detected: 0, bytes: [], error };
          }
          hints = codes.slice(0, MAX_CODES);
          this.locate(hints, video);
        } catch (failure) {
          // The detector is unusable on this frame: keep the cause and read it with jsQR alone.
          this.detectorFailures++;
          this._location.set(null);
          error =
            failure instanceof Error ? `${failure.name}: ${failure.message}` : String(failure);
        }
      }

      const regions = hints
        .map((hint) => regionAround(hint.boundingBox, frame))
        .filter((region): region is QrRegion => region !== null);
      let bytes: readonly Uint8Array[];
      if (worker && bitmap) {
        // The bitmap is transferred: the worker owns it and releases it after reading.
        released = true;
        const response = await this.ask(worker, bitmap, regions);
        bytes = response.bytes;
        error ??= response.error;
      } else {
        bytes = this.localReader.read(frame, regions);
      }
      if (bytes.length === 0) {
        // Only if jsQR cannot read any is the detector text taken as latin1, one char per byte.
        bytes = hints
          .map((hint) => hint.rawValue)
          .filter((raw) => raw !== '')
          .map((raw) => Uint8Array.from(raw, (char) => char.charCodeAt(0) & 0xff));
      }
      return { detected: Math.max(hints.length, bytes.length), bytes, error };
    } finally {
      if (!released) {
        bitmap?.close();
      }
    }
  }

  /** Keeps where the detector found each QR (those that came with a box) for the view to draw. */
  private locate(hints: readonly QrDetection[], video: HTMLVideoElement): void {
    const boxes = hints
      .map((hint) => hint.boundingBox)
      .filter((box): box is QrRegion => box !== undefined)
      .map(({ x, y, width, height }) => ({ x, y, width, height }));
    this._location.set(
      boxes.length > 0 ? { boxes, width: video.videoWidth, height: video.videoHeight } : null,
    );
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

  private ask(worker: Worker, bitmap: ImageBitmap, regions: readonly QrRegion[]) {
    return new Promise<QrWorkerResponse>((resolve, reject) => {
      const id = this.nextId++;
      this.pending = { id, resolve, reject };
      const request: QrWorkerRequest = { id, bitmap, regions };
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
