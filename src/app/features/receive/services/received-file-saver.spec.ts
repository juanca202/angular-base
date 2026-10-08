import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PrivateStorage, FileToStore } from '@/core/services/private-storage';
import { StorageQuotaError } from '@/core/services/storage-quota-error';
import { StoredTransfer } from '@/core/models/stored-transfer';
import { ReceivedFileSaver } from '@/features/receive/services/received-file-saver';
import { ReceivedFile } from '@/shared/utils/qr-protocol';

function receivedFile(name = 'foto.png', type = 'image/png'): ReceivedFile {
  const bytes = Uint8Array.of(1, 2, 3, 4);
  return { name, type, size: bytes.length, bytes };
}

describe('ReceivedFileSaver', () => {
  let saver: ReceivedFileSaver;
  let records: StoredTransfer[];
  let save: ReturnType<typeof vi.fn>;
  let requestPersistence: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    records = [];
    // Like the real storage, every save creates its own record with a new id.
    save = vi.fn(async (direction: StoredTransfer['direction'], file: FileToStore) => {
      const record: StoredTransfer = {
        id: `id-${records.length + 1}`,
        direction,
        name: file.name,
        type: file.type,
        size: file.bytes.byteLength,
        date: 0,
      };
      records.push(record);
      return record;
    });
    requestPersistence = vi.fn().mockResolvedValue(true);
    TestBed.configureTestingModule({
      providers: [{ provide: PrivateStorage, useValue: { save, requestPersistence } }],
    });
    saver = TestBed.inject(ReceivedFileSaver);
  });

  it('saves the file as received with its original name and type', async () => {
    // Arrange
    const file = receivedFile('informe.pdf', 'application/pdf');
    // Act
    const record = await saver.save(file);
    // Assert
    expect(save).toHaveBeenCalledWith('received', {
      name: 'informe.pdf',
      type: 'application/pdf',
      bytes: file.bytes,
    });
    expect(record).toMatchObject({
      direction: 'received',
      name: 'informe.pdf',
      type: 'application/pdf',
      size: 4,
    });
  });

  it('keeps an existing file with the same name and stores the new one as a separate record', async () => {
    // Arrange
    const first = await saver.save(receivedFile('foto.png'));
    // Act
    const second = await saver.save(receivedFile('foto.png'));
    // Assert
    expect(second.id).not.toBe(first.id);
    expect(records.map((r) => r.name)).toEqual(['foto.png', 'foto.png']);
  });

  it('requests persistent storage after a successful save', async () => {
    // Act
    await saver.save(receivedFile());
    // Assert
    expect(requestPersistence).toHaveBeenCalledTimes(1);
  });

  it('does not fail the save when persistence is denied or throws', async () => {
    // Arrange
    requestPersistence.mockRejectedValue(new Error('denied'));
    // Act
    const record = await saver.save(receivedFile());
    // Assert
    expect(record.name).toBe('foto.png');
  });

  it('propagates the quota error, registers nothing and does not ask for persistence', async () => {
    // Arrange
    save.mockRejectedValue(new StorageQuotaError(4, 0));
    // Act
    const result = saver.save(receivedFile());
    // Assert
    await expect(result).rejects.toBeInstanceOf(StorageQuotaError);
    expect(records).toEqual([]);
    expect(requestPersistence).not.toHaveBeenCalled();
  });
});
