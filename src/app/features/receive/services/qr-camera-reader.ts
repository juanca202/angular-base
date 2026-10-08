import { Service, inject, signal } from '@angular/core';
import { CameraError } from '@/features/receive/models/camera-error';
import { QrDecoder } from '@/features/receive/services/qr-decoder';

/** Pause between two reading attempts, so frames are never decoded concurrently. */
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
    this._active.set(false);
  }

  private async openCamera(): Promise<MediaStream> {
    const mediaDevices = (navigator as Partial<Navigator>).mediaDevices;
    if (!mediaDevices?.getUserMedia) {
      throw new CameraError('unsupported');
    }
    try {
      return await mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
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
      let bytes: Uint8Array | null = null;
      try {
        bytes = await this.decoder.decode(video);
      } catch {
        // A frame that cannot be decoded is skipped; the next one is tried.
      }
      if (this.session !== session) {
        return;
      }
      if (bytes) {
        onQr(bytes);
      }
      await new Promise<void>((resolve) => setTimeout(resolve, SCAN_INTERVAL_MS));
    }
  }
}
