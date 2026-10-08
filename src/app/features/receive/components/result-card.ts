import { Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Icon } from '@factor_ec/ui';
import { ReceiveResult } from '@/features/receive/models/receive-state';

/** Any result of the reception that did not end with a saved file. */
export type FailedReceiveResult = Exclude<ReceiveResult, { outcome: 'completed' }>;

interface CardContent {
  readonly title: string;
  readonly message: string;
}

/**
 * Card that explains a reception that did not end in a saved file and offers what the user can do:
 * keep scanning after «incomplete», retry from scratch after an error and, when the verified file
 * could not be saved, download it. It always states that nothing was saved or registered.
 */
@Component({
  selector: 'app-result-card',
  imports: [MatButtonModule, Icon],
  template: `
    <section
      role="alert"
      class="flex flex-col gap-3 rounded-lg border border-red-300 bg-red-50 p-4 text-red-950"
    >
      <h2 class="flex items-center gap-2 text-xl font-semibold">
        <ft-icon name="warning" aria-hidden="true" />
        <span>{{ content().title }}</span>
      </h2>
      <p>{{ content().message }}</p>
      <p i18n>No se guardó ni registró ningún archivo.</p>
      <div class="flex flex-wrap gap-3">
        @if (result().outcome === 'incomplete') {
          <button type="button" matButton="filled" (click)="continueScanning.emit()" i18n>
            Seguir escaneando
          </button>
        } @else {
          @if (canDownload()) {
            <button type="button" matButton="filled" (click)="download.emit()" i18n>
              Descargar archivo
            </button>
          }
          <button
            type="button"
            [matButton]="canDownload() ? 'outlined' : 'filled'"
            (click)="retry.emit()"
            i18n
          >
            Reintentar
          </button>
        }
      </div>
    </section>
  `,
  host: { class: 'block' },
})
export class ResultCard {
  /** Result to explain. */
  public readonly result = input.required<FailedReceiveResult>();
  /** The user wants to keep scanning, keeping the valid fragments already received. */
  public readonly continueScanning = output<void>();
  /** The user wants to start over from scratch. */
  public readonly retry = output<void>();
  /** The user wants to download the verified file that could not be saved. */
  public readonly download = output<void>();

  protected readonly canDownload = computed(() => {
    const outcome = this.result().outcome;
    return outcome === 'storage-full' || outcome === 'save-failed';
  });

  protected readonly content = computed<CardContent>(() => {
    const result = this.result();
    switch (result.outcome) {
      case 'incomplete':
        return {
          title: $localize`Recepción incompleta`,
          message:
            result.progress.total === 0
              ? $localize`No se leyó ningún fragmento de una transferencia.`
              : $localize`Faltan fragmentos: se recibieron ${result.progress.received}:received: de ${result.progress.total}:total:.`,
        };
      case 'invalid-data':
        return {
          title: $localize`Datos inválidos`,
          message: $localize`Se recibieron todos los fragmentos, pero el archivo no pasó la verificación de integridad.`,
        };
      case 'unreconstructable':
        return {
          title: $localize`Archivo no reconstruible`,
          message: $localize`No se pudo ensamblar el archivo: los datos del emisor son inconsistentes.`,
        };
      case 'storage-full':
        return {
          title: $localize`Almacenamiento lleno`,
          message: $localize`El archivo se recibió y verificó, pero la cuota de almacenamiento se agotó. Puedes descargarlo ahora.`,
        };
      case 'save-failed':
        return {
          title: $localize`No se pudo guardar`,
          message: $localize`El archivo se recibió y verificó, pero no se pudo guardar. Puedes descargarlo ahora.`,
        };
    }
  });
}
