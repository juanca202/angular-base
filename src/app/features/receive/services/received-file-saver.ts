import { Service, inject } from '@angular/core';
import { StoredTransfer } from '@/core/models/stored-transfer';
import { PrivateStorage } from '@/core/services/private-storage';
import { ReceivedFile } from '@/shared/utils/qr-protocol';

/**
 * Saves a verified received file in the application's private storage.
 *
 * The file keeps its original name and type. Every save creates its own record, so a file with the
 * same name as an existing one never overwrites it. No folder permission is requested: everything
 * goes to the private storage.
 */
@Service()
export class ReceivedFileSaver {
  private readonly storage = inject(PrivateStorage);

  /**
   * Stores the file as a received transfer and asks the browser to keep the storage persistent.
   *
   * @param file - File rebuilt and verified by the reassembler.
   * @returns The record added to the history.
   * @throws {StorageQuotaError} When the quota is exhausted; nothing is saved or registered, so the
   * caller can still offer the file from memory.
   */
  public async save(file: ReceivedFile): Promise<StoredTransfer> {
    const record = await this.storage.save('received', {
      name: file.name,
      type: file.type,
      bytes: file.bytes,
    });
    // Asking for persistence is a best effort and must not undo or fail a save that already succeeded.
    await this.storage.requestPersistence().catch(() => false);
    return record;
  }
}
