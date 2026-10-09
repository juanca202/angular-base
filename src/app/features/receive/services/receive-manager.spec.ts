import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { QrCameraReader } from '@/features/receive/services/qr-camera-reader';
import { ReceivedFileSaver } from '@/features/receive/services/received-file-saver';
import { ReceiveManager } from '@/features/receive/services/receive-manager';
import { CameraError } from '@/features/receive/models/camera-error';
import { StorageQuotaError } from '@/core/services/storage-quota-error';
import { StoredTransfer } from '@/core/models/stored-transfer';
import {
  ReceivedFile,
  crc32,
  fragmentFile,
  CRC_SIZE,
  HEADER_SIZE,
} from '@/shared/utils/qr-protocol';

function sampleBytes(size: number): Uint8Array<ArrayBuffer> {
  return Uint8Array.from({ length: size }, (_, i) => (i * 5 + 1) % 256);
}

async function transfer(name = 'foto.png', size = 1200): Promise<Uint8Array[]> {
  // 400 B per fragment and no compression (not the defaults) so the counts of these scenarios stay the same.
  return fragmentFile(
    { name, type: 'image/png', bytes: sampleBytes(size) },
    { dataSize: 400, compress: false },
  );
}

/** Rewrites a fragment with another payload and a valid CRC. */
function withPayload(fragment: Uint8Array, payload: Uint8Array): Uint8Array {
  const out = new Uint8Array(HEADER_SIZE + payload.length + CRC_SIZE);
  out.set(fragment.subarray(0, HEADER_SIZE));
  new DataView(out.buffer).setUint16(10, payload.length);
  out.set(payload, HEADER_SIZE);
  new DataView(out.buffer).setUint32(
    HEADER_SIZE + payload.length,
    crc32(out.subarray(0, HEADER_SIZE + payload.length)),
  );
  return out;
}

describe('ReceiveManager', () => {
  let manager: ReceiveManager;
  let onQr: (bytes: Uint8Array) => void;
  let readerStart: ReturnType<typeof vi.fn>;
  let readerStop: ReturnType<typeof vi.fn>;
  let save: ReturnType<typeof vi.fn>;
  const video = {} as HTMLVideoElement;

  beforeEach(() => {
    vi.useFakeTimers();
    readerStart = vi.fn(async (_video: HTMLVideoElement, callback: (bytes: Uint8Array) => void) => {
      onQr = callback;
    });
    readerStop = vi.fn();
    save = vi.fn(async (file: ReceivedFile): Promise<StoredTransfer> => ({
      id: 'r1',
      direction: 'received',
      name: file.name,
      type: file.type,
      size: file.size,
      date: 0,
    }));
    TestBed.configureTestingModule({
      providers: [
        {
          provide: QrCameraReader,
          useValue: { start: readerStart, stop: readerStop, active: signal(false) },
        },
        { provide: ReceivedFileSaver, useValue: { save } },
      ],
    });
    manager = TestBed.inject(ReceiveManager);
  });

  afterEach(() => vi.useRealTimers());

  /**
   * Delivers fragments and waits until the asynchronous completion (SHA-256 and saving) settles.
   * The digest runs outside the fake clock, so it is awaited by state instead of by elapsed time.
   */
  async function read(fragments: Uint8Array[]): Promise<void> {
    fragments.forEach((fragment) => onQr(fragment));
    await vi.waitFor(() => expect(manager.phase()).not.toBe('finishing'), { timeout: 5000 });
  }

  describe('starting', () => {
    it('opens the camera and starts reading', async () => {
      // Act
      await manager.start(video);
      // Assert
      expect(readerStart).toHaveBeenCalledWith(video, expect.any(Function));
      expect(manager.phase()).toBe('reading');
      expect(manager.progress().received).toBe(0);
    });

    it('does not start again while a reception is running', async () => {
      // Arrange
      await manager.start(video);
      // Act
      await manager.start(video);
      // Assert
      expect(readerStart).toHaveBeenCalledTimes(1);
    });

    it('exposes the camera error and does not begin the reception', async () => {
      // Arrange
      readerStart.mockRejectedValue(new CameraError('permission-denied'));
      // Act
      await manager.start(video);
      // Assert
      expect(manager.cameraError()).toBe('permission-denied');
      expect(manager.phase()).toBe('idle');
    });

    it('can start again after a camera error', async () => {
      // Arrange
      readerStart.mockRejectedValueOnce(new CameraError('no-camera'));
      await manager.start(video);
      // Act
      await manager.start(video);
      // Assert
      expect(manager.cameraError()).toBeNull();
      expect(manager.phase()).toBe('reading');
    });
  });

  describe('election of the transfer', () => {
    it('takes the first transfer with readable metadata as the active one, without asking', async () => {
      // Arrange
      await manager.start(video);
      const fragments = await transfer('foto.png', 1200);
      // Act
      await read([fragments[0]]);
      // Assert
      expect(manager.progress()).toMatchObject({ name: 'foto.png', size: 1200, received: 1 });
    });

    it('tells which fragments were received so the user knows what is missing', async () => {
      // Arrange
      await manager.start(video);
      const fragments = await transfer();
      // Act
      await read([fragments[0], fragments[2]]);
      // Assert
      expect([...manager.progress().fragments]).toEqual([0, 2]);
    });

    it('shows the fragments already read before the metadata arrived', async () => {
      // Arrange
      await manager.start(video);
      const fragments = await transfer();
      // Act
      await read([fragments[2], fragments[1], fragments[0]]);
      // Assert
      expect(manager.progress()).toMatchObject({
        received: 3,
        total: 4,
        percent: 75,
        name: 'foto.png',
      });
    });

    it('completes and saves by itself once every fragment was read', async () => {
      // Arrange
      await manager.start(video);
      // Act
      await read(await transfer());
      // Assert
      expect(manager.result()?.outcome).toBe('completed');
      expect(save).toHaveBeenCalledTimes(1);
    });

    it('does not complete before the metadata is read, even with every data fragment', async () => {
      // Arrange
      await manager.start(video);
      const fragments = await transfer();
      // Act
      await read(fragments.slice(1));
      // Assert
      expect(manager.phase()).toBe('reading');
      expect(save).not.toHaveBeenCalled();
    });

    it('ignores the fragments of other transfers once one is active', async () => {
      // Arrange
      await manager.start(video);
      const mine = await transfer('mio.png');
      const foreign = await transfer('ajeno.png');
      await read([mine[0], foreign[0]]);
      // Act
      await read([foreign[1], foreign[2], foreign[3], mine[1]]);
      // Assert
      expect(manager.progress()).toMatchObject({ name: 'mio.png', received: 2, total: 4 });
    });
  });

  describe('progress', () => {
    it('does not change when a fragment is repeated', async () => {
      // Arrange
      await manager.start(video);
      const fragments = await transfer();
      await read([fragments[0], fragments[1]]);
      const before = manager.progress();
      // Act
      await read([fragments[1], fragments[1]]);
      // Assert
      expect(manager.progress()).toEqual(before);
    });

    it('estimates the remaining time from the reading rate', async () => {
      // Arrange
      await manager.start(video);
      const fragments = await transfer('foto.png', 2000);
      await read([fragments[0]]);
      // Act
      await vi.advanceTimersByTimeAsync(1000);
      await read([fragments[1], fragments[2]]);
      // Assert
      const progress = manager.progress();
      expect(progress.received).toBe(3);
      expect(progress.remainingSeconds).not.toBeNull();
      expect(progress.remainingSeconds as number).toBeGreaterThan(0);
    });

    it('has no estimate before enough fragments are read', async () => {
      // Arrange
      await manager.start(video);
      // Act
      await read([(await transfer())[0]]);
      // Assert
      expect(manager.progress().remainingSeconds).toBeNull();
    });
  });

  describe('completion', () => {
    it('never shows 100 % while a fragment is missing, even if rounding would', async () => {
      // Arrange
      await manager.start(video);
      const fragments = await transfer('grande.png', 100_000);
      // Act
      await read(fragments.slice(0, -1));
      // Assert
      expect(manager.progress().percent).toBe(99);
      expect(manager.phase()).toBe('reading');
      expect(manager.result()).toBeNull();
      // Act
      await read(fragments.slice(-1));
      // Assert
      expect(manager.progress().percent).toBe(100);
      expect(manager.result()?.outcome).toBe('completed');
    });

    it('ends on a result instead of hanging when rebuilding the file fails unexpectedly', async () => {
      // Arrange
      await manager.start(video);
      const fragments = await transfer();
      const digest = vi.spyOn(crypto.subtle, 'digest').mockRejectedValue(new Error('no crypto'));
      try {
        // Act
        await read(fragments);
        // Assert
        expect(manager.phase()).toBe('result');
        expect(manager.result()).toEqual({ outcome: 'unreconstructable' });
      } finally {
        digest.mockRestore();
      }
    });

    it('releases the camera before saving and registers the received file', async () => {
      // Arrange
      await manager.start(video);
      const fragments = await transfer();
      await read([fragments[0]]);
      // Act
      await read(fragments.slice(1));
      // Assert
      expect(manager.result()).toMatchObject({ outcome: 'completed', record: { id: 'r1' } });
      expect(manager.phase()).toBe('result');
      expect(readerStop.mock.invocationCallOrder[0]).toBeLessThan(save.mock.invocationCallOrder[0]);
    });

    it('reports a storage-full result keeping the file, without registering it', async () => {
      // Arrange
      save.mockRejectedValue(new StorageQuotaError(1000, 0));
      await manager.start(video);
      const fragments = await transfer();
      await read([fragments[0]]);
      // Act
      await read(fragments.slice(1));
      // Assert
      const result = manager.result();
      expect(result?.outcome).toBe('storage-full');
      expect(result && 'file' in result ? result.file.bytes : null).toEqual(sampleBytes(1200));
    });

    it('reports a save-failed result for any other storage error', async () => {
      // Arrange
      save.mockRejectedValue(new Error('disk'));
      await manager.start(video);
      const fragments = await transfer();
      await read([fragments[0]]);
      // Act
      await read(fragments.slice(1));
      // Assert
      expect(manager.result()?.outcome).toBe('save-failed');
    });

    it('reports invalid data without saving when the hash does not match', async () => {
      // Arrange
      await manager.start(video);
      const fragments = await transfer();
      const altered = Uint8Array.from(fragments[1].subarray(12, fragments[1].length - 4));
      altered[0] ^= 1;
      await read([fragments[0]]);
      // Act
      await read([withPayload(fragments[1], altered), ...fragments.slice(2)]);
      // Assert
      expect(manager.result()).toEqual({ outcome: 'invalid-data' });
      expect(save).not.toHaveBeenCalled();
      expect(readerStop).toHaveBeenCalled();
    });

    it('reports unreconstructable without saving when the metadata is inconsistent', async () => {
      // Arrange
      await manager.start(video);
      const fragments = await transfer();
      const metadata = Uint8Array.from(fragments[0].subarray(12, fragments[0].length - 4));
      new DataView(metadata.buffer).setUint32(32, 9999);
      await read([withPayload(fragments[0], metadata)]);
      // Act
      await read(fragments.slice(1));
      // Assert
      expect(manager.result()).toEqual({ outcome: 'unreconstructable' });
      expect(save).not.toHaveBeenCalled();
    });

    it('ignores QR reads while the file is being finished', async () => {
      // Arrange
      await manager.start(video);
      const fragments = await transfer();
      await read([fragments[0]]);
      await read(fragments.slice(1));
      const result = manager.result();
      // Act
      await read([(await transfer('otro.png'))[0]]);
      // Assert
      expect(manager.result()).toBe(result);
    });
  });

  describe('finishing the reading by hand', () => {
    it('reports incomplete with the progress and does not save', async () => {
      // Arrange
      await manager.start(video);
      const fragments = await transfer();
      await read([fragments[0]]);
      await read([fragments[1]]);
      // Act
      await manager.finishReading();
      // Assert
      expect(manager.result()).toEqual({
        outcome: 'incomplete',
        progress: { received: 2, total: 4 },
      });
      expect(save).not.toHaveBeenCalled();
      expect(readerStop).toHaveBeenCalled();
    });

    it('reports incomplete when no transfer was elected', async () => {
      // Arrange
      await manager.start(video);
      await read([(await transfer())[0]]);
      // Act
      await manager.finishReading();
      // Assert
      expect(manager.result()?.outcome).toBe('incomplete');
      expect(save).not.toHaveBeenCalled();
    });

    it('keeps scanning after incomplete and completes with the remaining fragments', async () => {
      // Arrange
      await manager.start(video);
      const fragments = await transfer();
      await read([fragments[0]]);
      await read([fragments[1]]);
      await manager.finishReading();
      // Act
      await manager.continueScanning();
      await read(fragments.slice(2));
      // Assert
      expect(readerStart).toHaveBeenCalledTimes(2);
      expect(manager.result()?.outcome).toBe('completed');
    });

    it('does not continue scanning after a result other than incomplete', async () => {
      // Arrange
      await manager.start(video);
      const fragments = await transfer();
      const altered = Uint8Array.from(fragments[1].subarray(12, fragments[1].length - 4));
      altered[0] ^= 1;
      await read([fragments[0]]);
      await read([withPayload(fragments[1], altered), ...fragments.slice(2)]);
      // Act
      await manager.continueScanning();
      // Assert
      expect(readerStart).toHaveBeenCalledTimes(1);
    });
  });

  describe('retrying from scratch', () => {
    it('starts over without the previous fragments after an error', async () => {
      // Arrange
      await manager.start(video);
      const fragments = await transfer();
      const altered = Uint8Array.from(fragments[1].subarray(12, fragments[1].length - 4));
      altered[0] ^= 1;
      await read([fragments[0]]);
      await read([withPayload(fragments[1], altered), ...fragments.slice(2)]);
      // Act
      await manager.retry();
      // Assert
      expect(manager.result()).toBeNull();
      expect(manager.phase()).toBe('reading');
      expect(manager.progress().received).toBe(0);
      expect(readerStart).toHaveBeenCalledTimes(2);
    });
  });

  describe('cancelling', () => {
    it('stops, discards partial data and releases the camera without asking', async () => {
      // Arrange
      await manager.start(video);
      const fragments = await transfer();
      await read([fragments[0], fragments[1]]);
      // Act
      manager.cancel();
      // Assert
      expect(readerStop).toHaveBeenCalled();
      expect(manager.phase()).toBe('idle');
      expect(manager.progress().received).toBe(0);
      expect(save).not.toHaveBeenCalled();
    });

    it('ignores reads that arrive after cancelling', async () => {
      // Arrange
      await manager.start(video);
      const fragments = await transfer();
      manager.cancel();
      // Act
      await read(fragments);
      // Assert
      expect(manager.progress().received).toBe(0);
    });

    it('can cancel while the camera is still opening', async () => {
      // Arrange
      let release: () => void = () => undefined;
      readerStart.mockImplementation(() => new Promise<void>((resolve) => (release = resolve)));
      const starting = manager.start(video);
      // Act
      manager.cancel();
      release();
      await starting;
      // Assert
      expect(manager.phase()).toBe('idle');
    });
  });
});
