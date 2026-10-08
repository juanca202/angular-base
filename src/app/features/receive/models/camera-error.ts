/** Reasons why the camera cannot be used to read QR codes. */
export type CameraErrorCode = 'no-camera' | 'permission-denied' | 'unsupported';

/**
 * Typed error raised when the camera cannot be started. The reception must not begin when it is thrown.
 */
export class CameraError extends Error {
  /** Reason why the camera cannot be used. */
  public readonly code: CameraErrorCode;

  constructor(code: CameraErrorCode, message?: string) {
    super(message ?? code);
    this.name = 'CameraError';
    this.code = code;
  }
}
