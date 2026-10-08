import { Component, computed, input } from '@angular/core';
import { ReceiveProgress } from '@/features/receive/models/receive-state';
import { formatSeconds } from '@/shared/utils/format';
import { formatSize } from '@/shared/utils/format-size';

/**
 * Information about the file being received: name, total size, estimated time left, fragments
 * received and a progress bar with the percentage. On narrow screens the fragment count is omitted,
 * keeping name, size, time and percentage.
 */
@Component({
  selector: 'app-receive-progress',
  template: `
    <div class="flex flex-col gap-2">
      <p class="break-all font-medium">{{ progress().name ?? waitingText }}</p>
      @if (progress().size !== null) {
        <p>
          <span i18n>Tamaño total:</span> {{ size() }}
          <span class="hidden sm:inline" i18n
            >· {{ progress().received }} de {{ progress().total }} fragmentos</span
          >
        </p>
      }
      <p>
        <span i18n>Tiempo estimado:</span>
        {{ remaining() }}
      </p>
      <div class="flex items-center gap-3">
        <progress
          class="h-3 w-full"
          [value]="progress().percent"
          max="100"
          aria-label="Progreso de la recepción"
          i18n-aria-label
        ></progress>
        <span class="w-12 text-right tabular-nums">{{ progress().percent }} %</span>
      </div>
    </div>
  `,
  host: { class: 'block' },
})
export class ReceiveProgressInfo {
  /** Progress of the transfer being received. */
  public readonly progress = input.required<ReceiveProgress>();

  protected readonly waitingText = $localize`Esperando el primer QR…`;
  protected readonly size = computed(() => formatSize(this.progress().size ?? 0));
  protected readonly remaining = computed(() => {
    const seconds = this.progress().remainingSeconds;
    return seconds === null ? $localize`calculando…` : `~${formatSeconds(seconds)}`;
  });
}
