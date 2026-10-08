import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PrivateStorage } from '@/core/services/private-storage';
import { StorageQuotaError } from '@/core/services/storage-quota-error';

/** Doble mínimo de OPFS: un directorio en memoria con las operaciones que usa el servicio. */
class FakeFile {
  constructor(
    public data: Uint8Array = new Uint8Array(),
    public readonly name = '',
  ) {}
}

class FakeFileHandle {
  public readonly kind = 'file';
  constructor(
    public readonly name: string,
    private readonly store: FakeFile,
    private readonly failWrites: () => Error | undefined,
  ) {}

  public async getFile(): Promise<File> {
    return new File([this.store.data as BlobPart], this.name);
  }

  public async createWritable() {
    const store = this.store;
    const fail = this.failWrites;
    return {
      write: async (bytes: Uint8Array) => {
        const error = fail();
        if (error) {
          throw error;
        }
        store.data = bytes;
      },
      close: async () => undefined,
      abort: async () => undefined,
    };
  }
}

class FakeDirectory {
  public readonly kind = 'directory';
  public readonly files = new Map<string, FakeFile>();
  public writeError: Error | undefined;
  private readonly dirs = new Map<string, FakeDirectory>();

  public async getDirectoryHandle(name: string): Promise<FakeDirectory> {
    if (!this.dirs.has(name)) {
      this.dirs.set(name, new FakeDirectory());
    }
    return this.dirs.get(name)!;
  }

  public async getFileHandle(name: string, options?: { create?: boolean }) {
    if (!this.files.has(name)) {
      if (!options?.create) {
        throw new DOMException('no existe', 'NotFoundError');
      }
      this.files.set(name, new FakeFile());
    }
    return new FakeFileHandle(name, this.files.get(name)!, () => this.writeError);
  }

  public async removeEntry(name: string): Promise<void> {
    if (!this.files.delete(name)) {
      throw new DOMException('no existe', 'NotFoundError');
    }
  }

  public async *values() {
    for (const name of this.files.keys()) {
      yield new FakeFileHandle(name, this.files.get(name)!, () => this.writeError);
    }
  }
}

describe('PrivateStorage', () => {
  let root: FakeDirectory;
  let service: PrivateStorage;
  let estimate: { quota?: number; usage?: number };

  const bytes = (size: number) => new Uint8Array(new ArrayBuffer(size)).fill(7);
  const transfers = async () => root.getDirectoryHandle('transfers');

  beforeEach(() => {
    root = new FakeDirectory();
    estimate = { quota: 1_000_000, usage: 0 };
    vi.stubGlobal('navigator', {
      storage: {
        getDirectory: async () => root,
        estimate: async () => estimate,
        persist: vi.fn(async () => true),
        persisted: vi.fn(async () => false),
      },
    });
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrivateStorage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('guarda la copia y su registro, y los lista', async () => {
    const record = await service.save('sent', {
      name: 'a.pdf',
      type: 'application/pdf',
      bytes: bytes(100),
    });

    expect(record).toMatchObject({
      direction: 'sent',
      name: 'a.pdf',
      type: 'application/pdf',
      size: 100,
    });
    expect(await service.list()).toEqual([record]);
  });

  it('lee la copia con su nombre y tipo originales', async () => {
    const record = await service.save('received', {
      name: 'foto.png',
      type: 'image/png',
      bytes: bytes(20),
    });

    const file = await service.read(record.id);

    expect(file?.name).toBe('foto.png');
    expect(file?.type).toBe('image/png');
    expect(file?.size).toBe(20);
  });

  it('devuelve undefined al leer un registro inexistente', async () => {
    expect(await service.read('no-existe')).toBeUndefined();
  });

  it('lanza el error tipado y no escribe nada cuando la estimación no alcanza', async () => {
    estimate = { quota: 150, usage: 100 };

    await expect(
      service.save('sent', { name: 'a.bin', type: '', bytes: bytes(100) }),
    ).rejects.toBeInstanceOf(StorageQuotaError);
    expect((await transfers()).files.size).toBe(0);
  });

  it('acepta guardar cuando el tamaño es exactamente el espacio disponible', async () => {
    estimate = { quota: 100, usage: 0 };

    const record = await service.save('sent', { name: 'a.bin', type: '', bytes: bytes(100) });

    expect(record.size).toBe(100);
  });

  it('limpia la escritura incompleta y lanza el error tipado cuando la cuota se agota al escribir', async () => {
    (await transfers()).writeError = new DOMException('lleno', 'QuotaExceededError');

    await expect(
      service.save('sent', { name: 'a.bin', type: '', bytes: bytes(100) }),
    ).rejects.toBeInstanceOf(StorageQuotaError);
    expect((await transfers()).files.size).toBe(0);
    expect(await service.list()).toEqual([]);
  });

  it('propaga los errores de escritura que no son de cuota, también sin dejar archivos', async () => {
    const failure = new Error('disco');
    (await transfers()).writeError = failure;

    await expect(service.save('sent', { name: 'a.bin', type: '', bytes: bytes(10) })).rejects.toBe(
      failure,
    );
    expect((await transfers()).files.size).toBe(0);
  });

  it('elimina el archivo y su registro, y libera lo guardado', async () => {
    const record = await service.save('sent', { name: 'a.pdf', type: '', bytes: bytes(10) });
    const other = await service.save('received', { name: 'b.pdf', type: '', bytes: bytes(10) });

    await service.remove(record.id);

    expect(await service.list()).toEqual([other]);
    expect((await transfers()).files.has(record.id)).toBe(false);
    expect((await transfers()).files.has(record.id + '.json')).toBe(false);
  });

  it('no falla al eliminar un registro que ya no existe', async () => {
    await expect(service.remove('inexistente')).resolves.toBeUndefined();
  });

  it('solicita almacenamiento persistente', async () => {
    expect(await service.requestPersistence()).toBe(true);
    expect(navigator.storage.persist).toHaveBeenCalled();
  });

  it('no vuelve a solicitar persistencia si ya está concedida', async () => {
    vi.mocked(navigator.storage.persisted).mockResolvedValue(true);

    expect(await service.requestPersistence()).toBe(true);
    expect(navigator.storage.persist).not.toHaveBeenCalled();
  });

  it('informa false cuando el navegador no soporta persistencia', async () => {
    vi.stubGlobal('navigator', { storage: {} });

    expect(await service.requestPersistence()).toBe(false);
  });
});
