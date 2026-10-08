import { Service, computed, inject, signal } from '@angular/core';
import { HistoryFilter } from '@/core/models/history-filter';
import { StoredTransfer } from '@/core/models/stored-transfer';
import { PrivateStorage } from '@/core/services/private-storage';

/**
 * Servicio global con el historial de transferencias (enviadas y recibidas) guardadas en el
 * almacenamiento privado de la aplicación: lo entrega del más reciente al más antiguo, permite
 * filtrarlo por dirección y eliminar entradas liberando el espacio que ocupan.
 *
 * Solo lee y escribe a través de {@link PrivateStorage}.
 *
 * @example
 * ```typescript
 * const history = inject(TransferHistory);
 * await history.load();
 * history.setFilter('received');
 * const shown = history.visible();
 * ```
 *
 * @since 1.0.0
 */
@Service()
export class TransferHistory {
  private readonly storage = inject(PrivateStorage);

  private readonly all = signal<readonly StoredTransfer[]>([]);
  private readonly currentFilter = signal<HistoryFilter>('all');

  /** Todas las entradas, de la más reciente a la más antigua. */
  public readonly entries = this.all.asReadonly();
  /** Filtro activo; `all` por defecto. */
  public readonly filter = this.currentFilter.asReadonly();
  /** Entradas que coinciden con el filtro activo, en el mismo orden. */
  public readonly visible = computed(() => {
    const filter = this.currentFilter();
    return filter === 'all' ? this.all() : this.all().filter((e) => e.direction === filter);
  });

  /** Carga el historial desde el almacenamiento privado. */
  public async load(): Promise<void> {
    const records = await this.storage.list();
    this.all.set([...records].sort((a, b) => b.date - a.date));
  }

  /**
   * Cambia el filtro activo sin alterar el orden.
   *
   * @param filter - Todos, Recibidos o Enviados.
   */
  public setFilter(filter: HistoryFilter): void {
    this.currentFilter.set(filter);
  }

  /** Restablece el filtro a Todos. */
  public resetFilter(): void {
    this.currentFilter.set('all');
  }

  /**
   * Elimina una entrada: borra su archivo y su registro, y la quita del historial.
   * Si el borrado falla, el historial no cambia.
   *
   * @param id - Identificador de la entrada.
   */
  public async remove(id: string): Promise<void> {
    await this.storage.remove(id);
    this.all.update((entries) => entries.filter((e) => e.id !== id));
  }
}
