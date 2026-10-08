import { Service } from '@angular/core';
import { StoredTransfer, TransferDirection } from '@/core/models/stored-transfer';
import { StorageQuotaError } from '@/core/services/storage-quota-error';

/** Carpeta del almacenamiento privado (OPFS) donde viven las copias y su registro. */
const TRANSFERS_DIR = 'transfers';
/** Sufijo del archivo de metadatos que acompaña a cada copia. */
const META_SUFFIX = '.json';

/** Archivo a guardar: nombre, tipo y contenido. */
export interface FileToStore {
  readonly name: string;
  readonly type: string;
  readonly bytes: Uint8Array<ArrayBuffer>;
}

/**
 * Servicio global que guarda copias de archivos transferidos en el almacenamiento privado de la
 * aplicación (Origin Private File System) junto con un registro mínimo de metadatos.
 *
 * No escribe fuera del almacenamiento privado. Si la cuota no alcanza, lanza
 * {@link StorageQuotaError} sin dejar archivos a medias.
 *
 * @example
 * ```typescript
 * const storage = inject(PrivateStorage);
 * const record = await storage.save('sent', { name: 'a.pdf', type: 'application/pdf', bytes });
 * ```
 *
 * @since 1.0.0
 */
@Service()
export class PrivateStorage {
  /**
   * Guarda una copia del archivo y su registro.
   *
   * @param direction - Si la transferencia es enviada o recibida.
   * @param file - Nombre, tipo y contenido del archivo.
   * @returns El registro guardado.
   * @throws {StorageQuotaError} Si la cuota estimada no alcanza o la escritura la agota.
   */
  public async save(direction: TransferDirection, file: FileToStore): Promise<StoredTransfer> {
    await this.ensureQuota(file.bytes.byteLength);
    const dir = await this.directory();
    const id = crypto.randomUUID();
    const record: StoredTransfer = {
      id,
      direction,
      name: file.name,
      type: file.type,
      size: file.bytes.byteLength,
      date: Date.now(),
    };
    try {
      await this.write(dir, id, file.bytes);
      await this.write(dir, id + META_SUFFIX, new TextEncoder().encode(JSON.stringify(record)));
    } catch (error) {
      await this.discard(dir, id);
      if (this.isQuotaError(error)) {
        throw new StorageQuotaError(file.bytes.byteLength, await this.available());
      }
      throw error;
    }
    return record;
  }

  /**
   * Lista los registros guardados, sin ordenar.
   *
   * @returns Los registros de todas las transferencias guardadas.
   */
  public async list(): Promise<StoredTransfer[]> {
    const dir = await this.directory();
    const records: StoredTransfer[] = [];
    for await (const handle of dir.values()) {
      if (handle.kind === 'file' && handle.name.endsWith(META_SUFFIX)) {
        const file = await (handle as FileSystemFileHandle).getFile();
        records.push(JSON.parse(await file.text()) as StoredTransfer);
      }
    }
    return records;
  }

  /**
   * Lee el contenido de una copia guardada.
   *
   * @param id - Identificador del registro.
   * @returns Un `File` con el nombre y el tipo originales, o `undefined` si no existe.
   */
  public async read(id: string): Promise<File | undefined> {
    const dir = await this.directory();
    try {
      const meta = await (await dir.getFileHandle(id + META_SUFFIX)).getFile();
      const record = JSON.parse(await meta.text()) as StoredTransfer;
      const content = await (await dir.getFileHandle(id)).getFile();
      return new File([content], record.name, { type: record.type });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'NotFoundError') {
        return undefined;
      }
      throw error;
    }
  }

  /**
   * Solicita al navegador almacenamiento persistente para reducir el riesgo de que borre los archivos.
   *
   * @returns `true` si el almacenamiento quedó persistente; `false` si no está disponible o se denegó.
   */
  public async requestPersistence(): Promise<boolean> {
    if (!navigator.storage?.persist) {
      return false;
    }
    return (await navigator.storage.persisted?.()) || navigator.storage.persist();
  }

  private async directory(): Promise<FileSystemDirectoryHandle> {
    const root = await navigator.storage.getDirectory();
    return root.getDirectoryHandle(TRANSFERS_DIR, { create: true });
  }

  private async available(): Promise<number> {
    const { quota, usage } = await navigator.storage.estimate();
    return quota === undefined ? Number.POSITIVE_INFINITY : Math.max(0, quota - (usage ?? 0));
  }

  private async ensureQuota(required: number): Promise<void> {
    const available = await this.available();
    if (available < required) {
      throw new StorageQuotaError(required, available);
    }
  }

  private async write(
    dir: FileSystemDirectoryHandle,
    name: string,
    bytes: Uint8Array<ArrayBuffer>,
  ): Promise<void> {
    const handle = await dir.getFileHandle(name, { create: true });
    const writable = await handle.createWritable();
    try {
      await writable.write(bytes);
      await writable.close();
    } catch (error) {
      await writable.abort().catch(() => undefined);
      throw error;
    }
  }

  private async discard(dir: FileSystemDirectoryHandle, id: string): Promise<void> {
    for (const name of [id, id + META_SUFFIX]) {
      await dir.removeEntry(name).catch(() => undefined);
    }
  }

  private isQuotaError(error: unknown): boolean {
    return error instanceof DOMException && error.name === 'QuotaExceededError';
  }
}
