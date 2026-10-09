import { Service, signal } from '@angular/core';

/** Counters of each stage of the reading, to find where a QR gets lost. */
export interface ReceiveDiagnosticsSnapshot {
  /** Frames from the camera handed to the decoder. */
  readonly frames: number;
  /** Frames where a QR was spotted (by the native detector or by jsQR). */
  readonly detected: number;
  /** Frames where the QR bytes could be read. */
  readonly read: number;
  /** Size in bytes of the last QR read, or `null` if none. */
  readonly lastLength: number | null;
  /** Reads that are valid fragments of the protocol (version, length and CRC). */
  readonly valid: number;
  /** Message of the last error thrown while decoding a frame, or `null` if none. */
  readonly lastError: string | null;
  /** Size of the camera video as `width×height`, or `null` before the first frame. */
  readonly videoSize: string | null;
  /** Frames processed per second since the reading began, or `null` before the second frame. */
  readonly fps: number | null;
  /** Average milliseconds spent decoding one frame, or `null` before the first one. */
  readonly averageMs: number | null;
  /** Where the frames are read: in a Web Worker or in the page. `null` before the first frame. */
  readonly reader: 'worker' | 'page' | null;
  /** Whether the browser offers the native QR detector. `null` before the first frame. */
  readonly nativeDetector: boolean | null;
}

const EMPTY: ReceiveDiagnosticsSnapshot = {
  frames: 0,
  detected: 0,
  read: 0,
  lastLength: null,
  valid: 0,
  lastError: null,
  videoSize: null,
  fps: null,
  averageMs: null,
  reader: null,
  nativeDetector: null,
};

/**
 * Counts how far each camera frame gets (decoded, detected, read, valid fragment). The reception
 * screen shows it when opened with `?debug`, so a reading that does nothing can be diagnosed on the
 * device itself.
 */
@Service()
export class ReceiveDiagnostics {
  private readonly _state = signal<ReceiveDiagnosticsSnapshot>(EMPTY);
  private firstFrameAt = 0;

  /** Current counters. */
  public readonly state = this._state.asReadonly();

  /** Sets all counters back to zero. */
  public reset(): void {
    this.firstFrameAt = 0;
    this._state.set(EMPTY);
  }

  /**
   * A frame was handed to the decoder.
   *
   * @param video - Video the frame comes from, to record its real size.
   */
  public frame(video: HTMLVideoElement): void {
    const now = performance.now();
    this.firstFrameAt ||= now;
    this._state.update((s) => {
      const frames = s.frames + 1;
      const seconds = (now - this.firstFrameAt) / 1000;
      return {
        ...s,
        frames,
        videoSize: `${video.videoWidth}×${video.videoHeight}`,
        fps: frames > 1 && seconds > 0 ? Math.round((frames / seconds) * 10) / 10 : null,
      };
    });
  }

  /**
   * Records how long decoding a frame took, as a running average.
   *
   * @param ms - Milliseconds spent on the frame.
   */
  public timed(ms: number): void {
    this._state.update((s) => ({
      ...s,
      averageMs: s.averageMs === null ? ms : Math.round((s.averageMs * 0.9 + ms * 0.1) * 10) / 10,
    }));
  }

  /**
   * Records how the frames are being read.
   *
   * @param reader - Where the reading runs.
   * @param nativeDetector - Whether the native QR detector is available.
   */
  public mode(reader: 'worker' | 'page', nativeDetector: boolean): void {
    this._state.update((s) => ({ ...s, reader, nativeDetector }));
  }

  /** Decoding a frame threw; the frame is skipped but the cause is kept. */
  public failed(error: unknown): void {
    const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    this._state.update((s) => ({ ...s, lastError: message }));
  }

  /**
   * QR codes were spotted in a frame.
   *
   * @param count - How many; one by default.
   */
  public detected(count = 1): void {
    this._state.update((s) => ({ ...s, detected: s.detected + count }));
  }

  /** The bytes of a QR were read. */
  public read(length: number): void {
    this._state.update((s) => ({ ...s, read: s.read + 1, lastLength: length }));
  }

  /** A read turned out to be a valid fragment. */
  public valid(): void {
    this._state.update((s) => ({ ...s, valid: s.valid + 1 }));
  }
}
