import { Service, inject, signal } from '@angular/core';
import { CameraError } from '@/features/receive/models/camera-error';
import { QrDecoder } from '@/features/receive/services/qr-decoder';

/** Pause between two reading attempts when the browser cannot tell when a new frame is ready. */
const SCAN_INTERVAL_MS = 50;

/**
 * Reads QR codes continuously from the rear camera.
 *
 * Only one reading can be active at a time: `start` is ignored while another reading is starting or
 * running. The camera is released by `stop`, which the caller must invoke on cancel, completion or
 * when leaving the screen.
 */
@Service()
export class QrCameraReader {
  private readonly decoder = inject(QrDecoder);

  private session: object | null = null;
  private stream: MediaStream | null = null;
  private video: HTMLVideoElement | null = null;
  private readonly _active = signal(false);

  /** Whether a reading is starting or in progress. */
  public readonly active = this._active.asReadonly();

  /**
   * Starts reading QR codes from the camera.
   *
   * @param video - Video element where the camera preview is shown.
   * @param onQr - Called with the payload bytes of every QR read.
   * @throws {CameraError} When the browser is unsupported, there is no camera or permission is denied.
   */
  public async start(video: HTMLVideoElement, onQr: (bytes: Uint8Array) => void): Promise<void> {
    if (this.session) {
      return;
    }
    const session = {};
    this.session = session;
    this._active.set(true);
    try {
      const stream = await this.openCamera();
      if (this.session !== session) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      this.stream = stream;
      this.video = video;
      video.srcObject = stream;
      await video.play();
    } catch (error) {
      if (this.session === session) {
        this.stop();
      }
      throw error;
    }
    if (this.session === session) {
      void this.scan(video, onQr, session);
    }
  }

  /** Stops reading and releases the camera. Safe to call when no reading is active. */
  public stop(): void {
    this.session = null;
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    if (this.video) {
      this.video.srcObject = null;
      this.video = null;
    }
    this.decoder.clearLocation();
    this._active.set(false);
  }

  private async openCamera(): Promise<MediaStream> {
    const mediaDevices = (navigator as Partial<Navigator>).mediaDevices;
    if (!mediaDevices?.getUserMedia) {
      throw new CameraError('unsupported');
    }
    try {
      return await mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          // Larger frames (a phone in portrait gives 1080×1920) can fail to be captured for lack of memory.
          width: { ideal: 1280 },
          height: { ideal: 720 },
          // A dense QR needs sharp modules: ask for continuous autofocus where it is supported.
          advanced: [{ focusMode: 'continuous' } as MediaTrackConstraintSet],
        },
        audio: false,
      });
    } catch (error) {
      const name = error instanceof Error ? error.name : '';
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        throw new CameraError('permission-denied');
      }
      throw new CameraError('no-camera');
    }
  }

  private async scan(
    video: HTMLVideoElement,
    onQr: (bytes: Uint8Array) => void,
    session: object,
  ): Promise<void> {
    while (this.session === session) {
      let found: readonly Uint8Array[] = [];
      try {
        found = await this.decoder.decode(video);
      } catch {
        // A frame that cannot be decoded is skipped; the next one is tried.
      }
      if (this.session !== session) {
        return;
      }
      found.forEach((bytes) => onQr(bytes));
      await this.nextFrame(video);
    }
  }

  /**
   * Waits for the camera to produce a new frame, so each attempt reads a fresh one and no time is
   * lost sleeping. Frames that arrive while one is being decoded are skipped: decoding is never
   * concurrent. Without `requestVideoFrameCallback` it falls back to a short pause.
   */
  private nextFrame(video: HTMLVideoElement): Promise<void> {
    return new Promise<void>((resolve) => {
      if (typeof video.requestVideoFrameCallback === 'function') {
        video.requestVideoFrameCallback(() => resolve());
      } else {
        setTimeout(resolve, SCAN_INTERVAL_MS);
      }
    });
  }
}
