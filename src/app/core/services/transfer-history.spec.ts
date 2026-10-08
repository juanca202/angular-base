import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StoredTransfer } from '@/core/models/stored-transfer';
import { PrivateStorage } from '@/core/services/private-storage';
import { TransferHistory } from '@/core/services/transfer-history';

function entry(id: string, direction: 'sent' | 'received', date: number): StoredTransfer {
  return { id, direction, name: `${id}.bin`, type: '', size: 10, date };
}

describe('TransferHistory', () => {
  let stored: StoredTransfer[];
  let storage: { list: ReturnType<typeof vi.fn>; remove: ReturnType<typeof vi.fn> };
  let service: TransferHistory;

  const ids = () => service.entries().map((e) => e.id);

  beforeEach(() => {
    stored = [];
    storage = {
      list: vi.fn(async () => [...stored]),
      remove: vi.fn(async (id: string) => {
        stored = stored.filter((e) => e.id !== id);
      }),
    };
    TestBed.configureTestingModule({ providers: [{ provide: PrivateStorage, useValue: storage }] });
    service = TestBed.inject(TransferHistory);
  });

  it('ordena del más reciente al más antiguo aunque se hayan insertado desordenadas', async () => {
    stored = [entry('t3', 'sent', 300), entry('t1', 'received', 100), entry('t2', 'sent', 200)];

    await service.load();

    expect(ids()).toEqual(['t3', 't2', 't1']);
  });

  it('conserva todas las entradas con la misma fecha, sin pérdidas ni duplicados', async () => {
    stored = [entry('a', 'sent', 100), entry('b', 'received', 100)];

    await service.load();

    expect(ids().sort()).toEqual(['a', 'b']);
  });

  it('muestra todas por defecto', async () => {
    stored = [entry('s', 'sent', 2), entry('r', 'received', 1)];

    await service.load();

    expect(service.filter()).toBe('all');
    expect(service.visible().map((e) => e.id)).toEqual(['s', 'r']);
  });

  it('filtra recibidos sin alterar el orden', async () => {
    stored = [entry('r1', 'received', 1), entry('s', 'sent', 2), entry('r2', 'received', 3)];
    await service.load();

    service.setFilter('received');

    expect(service.visible().map((e) => e.id)).toEqual(['r2', 'r1']);
  });

  it('filtra enviados sin alterar el orden', async () => {
    stored = [entry('s1', 'sent', 1), entry('r', 'received', 2), entry('s2', 'sent', 3)];
    await service.load();

    service.setFilter('sent');

    expect(service.visible().map((e) => e.id)).toEqual(['s2', 's1']);
  });

  it('vuelve a Todos al reiniciar el filtro', async () => {
    service.setFilter('sent');

    service.resetFilter();

    expect(service.filter()).toBe('all');
  });

  it('elimina la entrada: borra del almacenamiento y la quita del historial', async () => {
    stored = [entry('a', 'sent', 2), entry('b', 'received', 1)];
    await service.load();

    await service.remove('a');

    expect(storage.remove).toHaveBeenCalledWith('a');
    expect(ids()).toEqual(['b']);
  });

  it('queda vacío al eliminar la última entrada', async () => {
    stored = [entry('a', 'sent', 1)];
    await service.load();

    await service.remove('a');

    expect(service.entries()).toEqual([]);
    expect(service.visible()).toEqual([]);
  });

  it('conserva el historial si el borrado falla', async () => {
    stored = [entry('a', 'sent', 1)];
    await service.load();
    storage.remove.mockRejectedValueOnce(new Error('fallo'));

    await expect(service.remove('a')).rejects.toThrow('fallo');

    expect(ids()).toEqual(['a']);
  });

  it('solo usa el almacenamiento privado: lee con list y borra con remove', async () => {
    stored = [entry('a', 'sent', 1)];

    await service.load();
    await service.remove('a');

    expect(Object.keys(storage).sort()).toEqual(['list', 'remove']);
  });
});
