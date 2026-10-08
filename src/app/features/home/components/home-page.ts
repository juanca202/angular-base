import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { Icon } from '@factor_ec/ui';
import { HistoryFilter } from '@/core/models/history-filter';
import { StoredTransfer } from '@/core/models/stored-transfer';
import { FileExport } from '@/core/services/file-export';
import { PrivateStorage } from '@/core/services/private-storage';
import { TransferHistory } from '@/core/services/transfer-history';
import { confirm, notify } from '@/core/utils/notification';
import { HistoryList } from '@/features/home/components/history-list';

/**
 * Pantalla de inicio: botones Enviar y Recibir, y debajo el historial de transferencias con filtro
 * Todos / Recibidos / Enviados (Todos por defecto), y las acciones Exportar, Compartir y Eliminar
 * por fila. Eliminar pide confirmación antes de borrar.
 *
 * @since 1.0.0
 */
@Component({
  selector: 'app-home-page',
  imports: [RouterLink, MatButtonModule, Icon, HistoryList],
  templateUrl: './home-page.html',
  host: { class: 'block' },
})
export class HomePage {
  private readonly history = inject(TransferHistory);
  private readonly storage = inject(PrivateStorage);
  private readonly fileExport = inject(FileExport);

  protected readonly filter = this.history.filter;
  protected readonly visible = this.history.visible;
  protected readonly loaded = signal(false);
  protected readonly isEmpty = computed(() => this.loaded() && this.history.entries().length === 0);
  protected readonly shareAvailable = this.fileExport.isShareAvailable();
  protected readonly filters: readonly { value: HistoryFilter; label: string }[] = [
    { value: 'all', label: $localize`Todos` },
    { value: 'received', label: $localize`Recibidos` },
    { value: 'sent', label: $localize`Enviados` },
  ];

  constructor() {
    this.history.resetFilter();
    this.history
      .load()
      .catch(() => notify($localize`No se pudo cargar el historial.`, { level: 'error' }))
      .finally(() => this.loaded.set(true));
  }

  protected setFilter(filter: HistoryFilter): void {
    this.history.setFilter(filter);
  }

  protected async exportEntry(entry: StoredTransfer): Promise<void> {
    const file = await this.readFile(entry);
    if (file) {
      this.fileExport.download(file);
    }
  }

  protected async shareEntry(entry: StoredTransfer): Promise<void> {
    const file = await this.readFile(entry);
    if (!file) {
      return;
    }
    if (!this.fileExport.canShare(file)) {
      notify($localize`Este archivo no se puede compartir desde este navegador. Expórtalo.`, {
        level: 'error',
      });
      return;
    }
    try {
      await this.fileExport.share(file);
    } catch {
      notify($localize`No se pudo compartir el archivo.`, { level: 'error' });
    }
  }

  protected async removeEntry(entry: StoredTransfer): Promise<void> {
    const answer = await confirm($localize`¿Eliminar «${entry.name}:name:» del historial?`, {
      actions: [
        { label: $localize`Eliminar`, value: 'delete', type: 'filled' },
        { label: $localize`Cancelar`, value: 'cancel', type: 'outlined' },
      ],
    });
    if (answer !== 'delete') {
      return;
    }
    try {
      await this.history.remove(entry.id);
    } catch {
      notify($localize`No se pudo eliminar el archivo.`, { level: 'error' });
    }
  }

  private async readFile(entry: StoredTransfer): Promise<File | undefined> {
    try {
      const file = await this.storage.read(entry.id);
      if (!file) {
        notify($localize`El archivo ya no está disponible.`, { level: 'error' });
      }
      return file;
    } catch {
      notify($localize`No se pudo leer el archivo.`, { level: 'error' });
      return undefined;
    }
  }
}
