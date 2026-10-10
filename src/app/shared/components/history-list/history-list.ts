import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { Icon } from '@factor_ec/ui';
import { StoredTransfer } from '@/core/models/stored-transfer';
import { formatSize } from '@/shared/utils/format-size';

/**
 * Lista de transferencias del historial: una fila por entrada con su contenido y un menú ⋮ con las
 * acciones Exportar, Compartir (si el navegador lo permite) y Eliminar. No decide nada: emite las acciones.
 *
 * @since 1.0.0
 */
@Component({
  selector: 'app-history-list',
  imports: [DatePipe, Icon, MatButtonModule, MatMenuModule],
  templateUrl: './history-list.html',
  host: { class: 'block' },
})
export class HistoryList {
  /** Entradas a mostrar, en el orden recibido. */
  public readonly entries = input.required<readonly StoredTransfer[]>();
  /** Si se ofrece la acción Compartir. */
  public readonly shareAvailable = input(false);

  /** Se pidió exportar por descarga una entrada. */
  public readonly exportEntry = output<StoredTransfer>();
  /** Se pidió compartir una entrada con otras aplicaciones. */
  public readonly shareEntry = output<StoredTransfer>();
  /** Se pidió eliminar una entrada. */
  public readonly removeEntry = output<StoredTransfer>();

  protected size(entry: StoredTransfer): string {
    return formatSize(entry.size);
  }

  protected direction(entry: StoredTransfer): string {
    return entry.direction === 'sent' ? $localize`Enviado` : $localize`Recibido`;
  }

  protected actionsLabel(entry: StoredTransfer): string {
    return $localize`Acciones de ${entry.name}:name:`;
  }
}
