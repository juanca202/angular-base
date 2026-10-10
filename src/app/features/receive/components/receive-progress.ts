import { Component, computed, input } from '@angular/core';
import { FragmentBar } from '@/shared/components/fragment-bar/fragment-bar';
import { ReceiveProgress } from '@/features/receive/models/receive-state';
import { formatSeconds } from '@/shared/utils/format';
import { formatSize } from '@/shared/utils/format-size';

/**
 * Information about the file being received: a row with the total size, the estimated time left and
 * the percentage received (in that order, spread across the row), and a bar of the fragments received
 * that shows what is still missing. The file name and the fragment count go in the header of the
 * sheet. The size and time carry visually hidden labels so the row stays short on narrow screens.
 */
@Component({
  selector: 'app-receive-progress',
  imports: [FragmentBar],
  template: `
    <div class="flex flex-col gap-2">
      <div class="flex justify-between gap-2">
        <span>
          @if (progress().size !== null) {
            <span class="sr-only" i18n>Tamaño total:</span>{{ size() }}
          }
        </span>
        <span> <span class="sr-only" i18n>Tiempo estimado:</span>{{ remaining() }} </span>
        <span class="tabular-nums">
          <span class="sr-only" i18n>Progreso:</span>{{ progress().percent }} %
        </span>
      </div>
      @if (progress().total > 0) {
        <app-fragment-bar
          [total]="progress().total"
          [received]="progress().fragments"
          label="Fragmentos recibidos"
          i18n-label
        />
        <p class="text-sm" i18n>
          Verde: QR ya recibidos. Gris: los que faltan; busca ese tramo en el emisor.
        </p>
      }
    </div>
  `,
  host: { class: 'block' },
})
export class ReceiveProgressInfo {
  /** Progress of the transfer being received. */
  public readonly progress = input.required<ReceiveProgress>();

  protected readonly size = computed(() => formatSize(this.progress().size ?? 0));
  protected readonly remaining = computed(() => {
    const seconds = this.progress().remainingSeconds;
    return seconds === null ? $localize`calculando…` : `~${formatSeconds(seconds)}`;
  });
}
