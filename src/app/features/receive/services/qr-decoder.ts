import { Service } from '@angular/core';
import jsQR from 'jsqr';

/** Minimal `BarcodeDetector` shape used here (the API is not yet in the TypeScript DOM lib). */
interface QrDetector {
  detect(source: HTMLVideoElement): Promise<{ rawValue: string }[]>;
}

type QrDetectorConstructor = new (options: { formats: string[] }) => QrDetector;

/** Pixels of a captured video frame, as consumed by the JavaScript reader. */
export interface QrFrame {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

/**
 * Reads the bytes of a QR code from a video element.
 *
 * Uses the native `BarcodeDetector` when the browser provides it (Chromium) and falls back to the
 * `jsQR` JavaScript reader otherwise (Safari, Firefox). Both return the raw payload as bytes.
 */
@Service()
export class QrDecoder {
  private detector: QrDetector | null = null;
  private canvas: HTMLCanvasElement | null = null;

  /**
   * Decodes the QR visible in the current video frame.
   *
   * @param video - Video element showing the camera stream.
   * @returns The payload bytes, or `null` when no QR is found in the frame.
   */
  public async decode(video: HTMLVideoElement): Promise<Uint8Array | null> {
    const detectorConstructor = (globalThis as { BarcodeDetector?: QrDetectorConstructor })
      .BarcodeDetector;
    if (detectorConstructor) {
      return this.decodeNative(video, detectorConstructor);
    }
    return this.decodeWithFallback(this.grabFrame(video));
  }

  /**
   * Captures the current video frame as pixels.
   *
   * @internal Public only so tests can replace it; there is no canvas in the unit-test environment.
   */
  public grabFrame(video: HTMLVideoElement): QrFrame {
    this.canvas ??= document.createElement('canvas');
    const width = video.videoWidth;
    const height = video.videoHeight;
    this.canvas.width = width;
    this.canvas.height = height;
    const context = this.canvas.getContext('2d', { willReadFrequently: true });
    if (!context) {
      return { data: new Uint8ClampedArray(0), width: 0, height: 0 };
    }
    context.drawImage(video, 0, 0, width, height);
    return context.getImageData(0, 0, width, height);
  }

  private async decodeNative(
    video: HTMLVideoElement,
    detectorConstructor: QrDetectorConstructor,
  ): Promise<Uint8Array | null> {
    this.detector ??= new detectorConstructor({ formats: ['qr_code'] });
    const codes = await this.detector.detect(video);
    if (codes.length === 0) {
      return null;
    }
    // The detector returns the payload as text where each char is one byte (latin1), validated in WI-002.
    return Uint8Array.from(codes[0].rawValue, (char) => char.charCodeAt(0) & 0xff);
  }

  private decodeWithFallback(frame: QrFrame): Uint8Array | null {
    if (frame.width === 0 || frame.height === 0) {
      return null;
    }
    const code = jsQR(frame.data, frame.width, frame.height, { inversionAttempts: 'dontInvert' });
    return code ? Uint8Array.from(code.binaryData) : null;
  }
}
