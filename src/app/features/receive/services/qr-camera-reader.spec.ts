import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { QrCameraReader } from '@/features/receive/services/qr-camera-reader';
import { QrDecoder } from '@/features/receive/services/qr-decoder';
import { CameraError } from '@/features/receive/models/camera-error';

function createStream() {
  const track = { stop: vi.fn() };
  return { track, stream: { getTracks: () => [track] } as unknown as MediaStream };
}

function createVideo() {
  return {
    srcObject: null,
    play: vi.fn().mockResolvedValue(undefined),
  } as unknown as HTMLVideoElement;
}

function domError(name: string): Error {
  const error = new Error(name);
  error.name = name;
  return error;
}

describe('QrCameraReader', () => {
  let reader: QrCameraReader;
  let decode: ReturnType<typeof vi.fn>;
  let clearLocation: ReturnType<typeof vi.fn>;
  let getUserMedia: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    decode = vi.fn().mockResolvedValue([]);
    clearLocation = vi.fn();
    getUserMedia = vi.fn();
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } });
    TestBed.configureTestingModule({
      providers: [{ provide: QrDecoder, useValue: { decode, clearLocation } }],
    });
    reader = TestBed.inject(QrCameraReader);
  });

  afterEach(() => {
    reader.stop();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('starts the rear camera, plays the stream and reports the reader as active', async () => {
    // Arrange
    const { stream } = createStream();
    getUserMedia.mockResolvedValue(stream);
    const video = createVideo();
    // Act
    await reader.start(video, vi.fn());
    // Assert
    expect(getUserMedia).toHaveBeenCalledWith(
      expect.objectContaining({
        video: expect.objectContaining({ facingMode: 'environment' }),
        audio: false,
      }),
    );
    expect(video.srcObject).toBe(stream);
    expect(video.play).toHaveBeenCalled();
    expect(reader.active()).toBe(true);
  });

  it('delivers every QR read without user interaction and ignores empty frames', async () => {
    // Arrange
    getUserMedia.mockResolvedValue(createStream().stream);
    decode
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([Uint8Array.of(1)])
      .mockResolvedValueOnce([Uint8Array.of(2)]);
    const onQr = vi.fn();
    // Act
    await reader.start(createVideo(), onQr);
    await vi.advanceTimersByTimeAsync(500);
    // Assert
    expect(onQr.mock.calls).toEqual([[Uint8Array.of(1)], [Uint8Array.of(2)]]);
  });

  it('delivers both QR codes of a frame when the sender shows two at once', async () => {
    // Arrange
    getUserMedia.mockResolvedValue(createStream().stream);
    decode
      .mockResolvedValueOnce([Uint8Array.of(1), Uint8Array.of(2)])
      .mockResolvedValueOnce([Uint8Array.of(3)]);
    const onQr = vi.fn();
    // Act
    await reader.start(createVideo(), onQr);
    await vi.advanceTimersByTimeAsync(500);
    // Assert
    expect(onQr.mock.calls).toEqual([[Uint8Array.of(1)], [Uint8Array.of(2)], [Uint8Array.of(3)]]);
  });

  it('reads each new camera frame when the browser reports them, without sleeping in between', async () => {
    // Arrange
    getUserMedia.mockResolvedValue(createStream().stream);
    const frameCallbacks: (() => void)[] = [];
    const video = Object.assign(createVideo(), {
      requestVideoFrameCallback: vi.fn((callback: () => void) => frameCallbacks.push(callback)),
    });
    decode.mockResolvedValue([Uint8Array.of(1)]);
    const onQr = vi.fn();
    // Act
    await reader.start(video, onQr);
    await vi.advanceTimersByTimeAsync(1000);
    // Assert: nothing is decoded again until the camera delivers the next frame
    expect(decode).toHaveBeenCalledTimes(1);
    frameCallbacks.shift()?.();
    await vi.advanceTimersByTimeAsync(0);
    expect(decode).toHaveBeenCalledTimes(2);
    expect(onQr).toHaveBeenCalledTimes(2);
  });

  it('does not start a second reading while one is starting or in progress', async () => {
    // Arrange
    getUserMedia.mockResolvedValue(createStream().stream);
    const video = createVideo();
    // Act
    await Promise.all([reader.start(video, vi.fn()), reader.start(video, vi.fn())]);
    await reader.start(video, vi.fn());
    // Assert
    expect(getUserMedia).toHaveBeenCalledTimes(1);
  });

  it('releases the camera and stops reading on stop', async () => {
    // Arrange
    const { stream, track } = createStream();
    getUserMedia.mockResolvedValue(stream);
    const video = createVideo();
    await reader.start(video, vi.fn());
    await vi.advanceTimersByTimeAsync(100);
    // Act
    reader.stop();
    const callsAtStop = decode.mock.calls.length;
    await vi.advanceTimersByTimeAsync(500);
    // Assert
    expect(track.stop).toHaveBeenCalled();
    expect(video.srcObject).toBeNull();
    expect(reader.active()).toBe(false);
    expect(decode.mock.calls.length).toBe(callsAtStop);
  });

  it('releases the stream when stopped before the camera is ready', async () => {
    // Arrange
    const { stream, track } = createStream();
    getUserMedia.mockResolvedValue(stream);
    // Act
    const starting = reader.start(createVideo(), vi.fn());
    reader.stop();
    await starting;
    // Assert
    expect(track.stop).toHaveBeenCalled();
    expect(reader.active()).toBe(false);
  });

  it('can start again after stopping', async () => {
    // Arrange
    getUserMedia.mockImplementation(() => Promise.resolve(createStream().stream));
    await reader.start(createVideo(), vi.fn());
    reader.stop();
    // Act
    await reader.start(createVideo(), vi.fn());
    // Assert
    expect(getUserMedia).toHaveBeenCalledTimes(2);
    expect(reader.active()).toBe(true);
  });

  it.each([
    ['NotAllowedError', 'permission-denied'],
    ['SecurityError', 'permission-denied'],
    ['NotFoundError', 'no-camera'],
    ['OverconstrainedError', 'no-camera'],
  ])('maps %s to the %s error and does not start', async (name, code) => {
    // Arrange
    getUserMedia.mockRejectedValue(domError(name));
    // Act
    const result = reader.start(createVideo(), vi.fn());
    // Assert
    await expect(result).rejects.toMatchObject({ name: 'CameraError', code });
    await expect(result).rejects.toBeInstanceOf(CameraError);
    expect(reader.active()).toBe(false);
  });

  it('rejects as unsupported when the browser has no camera API', async () => {
    // Arrange
    vi.stubGlobal('navigator', {});
    // Act
    const result = reader.start(createVideo(), vi.fn());
    // Assert
    await expect(result).rejects.toMatchObject({ code: 'unsupported' });
    expect(reader.active()).toBe(false);
  });

  it('keeps reading when a frame fails to decode', async () => {
    // Arrange
    getUserMedia.mockResolvedValue(createStream().stream);
    decode.mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce([Uint8Array.of(9)]);
    const onQr = vi.fn();
    // Act
    await reader.start(createVideo(), onQr);
    await vi.advanceTimersByTimeAsync(300);
    // Assert
    expect(onQr).toHaveBeenCalledWith(Uint8Array.of(9));
  });

  it('clears the QR location when it stops', async () => {
    // Arrange
    const { stream } = createStream();
    getUserMedia.mockResolvedValue(stream);
    await reader.start(createVideo(), vi.fn());
    // Act
    reader.stop();
    // Assert
    expect(clearLocation).toHaveBeenCalled();
  });
});
