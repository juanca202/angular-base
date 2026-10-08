import { Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { PendingTransfer } from '@/features/receive/models/receive-state';
import { formatSize } from '@/shared/utils/format-size';

/**
 * Notice that asks to confirm or discard a transfer after reading its name and size. It stays visible
 * until the user decides; nothing is completed or saved before confirming.
 */
@Component({
  selector: 'app-transfer-confirmation',
  imports: [MatButtonModule],
  template: `
    <section
      role="alert"
      class="flex flex-col gap-3 rounded-lg border border-amber-400 bg-amber-50 p-4 text-amber-950"
    >
      <p class="font-medium">
        <ng-container i18n>¿Recibir</ng-container> «{{ transfer().name }}» ({{ size() }})?
      </p>
      <p i18n>Hasta confirmar no se guarda nada.</p>
      <div class="flex gap-3">
        <button type="button" matButton="filled" (click)="confirmed.emit()" i18n>Confirmar</button>
        <button type="button" matButton="outlined" (click)="discarded.emit()" i18n>
          Descartar
        </button>
      </div>
    </section>
  `,
  host: { class: 'block' },
})
export class TransferConfirmation {
  /** Transfer waiting for the decision. */
  public readonly transfer = input.required<PendingTransfer>();
  /** The user accepts the transfer. */
  public readonly confirmed = output<void>();
  /** The user rejects the transfer. */
  public readonly discarded = output<void>();

  protected readonly size = computed(() => formatSize(this.transfer().size));
}
