import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { PrivateStorage } from '@/core/services/private-storage';
import { StorageQuotaError } from '@/core/services/storage-quota-error';
import { QrCanvas } from '@/features/send/components/qr-canvas';
import { SendSequenceManager } from '@/features/send/managers/send-sequence-manager';
import { SendFileValidator } from '@/features/send/services/send-file-validator';
import { formatSize } from '@/shared/utils/format-size';
import { countFragments, fragmentFile } from '@/shared/utils/qr-protocol';

/** Datos del archivo que se muestran bajo el QR. */
interface SendInfo {
  readonly name: string;
  readonly type: string;
  readonly size: number;
  readonly totalQr: number;
}

/** Formatea una duración en milisegundos como minutos y segundos. */
function formatDuration(ms: number): string {
  const seconds = Math.round(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  return minutes > 0 ? `${minutes} min ${seconds % 60} s` : `${seconds} s`;
}

/**
 * Pantalla de envío: abre el selector de un solo archivo, guarda una copia en el almacenamiento
 * privado, emite la secuencia de QR en bucle y muestra la información del archivo. No muestra
 * progreso de transmisión porque el emisor no tiene canal de retorno.
 *
 * @since 1.0.0
 */
@Component({
  selector: 'app-send-page',
  imports: [QrCanvas, MatButtonModule],
  templateUrl: './send-page.html',
  host: { class: 'block' },
})
export class SendPage {
  private readonly manager = inject(SendSequenceManager);
  private readonly storage = inject(PrivateStorage);
  private readonly validator = inject(SendFileValidator);

  private readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly currentQr = this.manager.currentQr;
  protected readonly sending = this.manager.active;
  protected readonly info = signal<SendInfo | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly busy = signal(false);
  protected readonly lapTime = computed(() => {
    const ms = this.manager.progress().estimatedLapMs;
    return ms === null ? $localize`calculando…` : formatDuration(ms);
  });
  protected readonly fileSize = computed(() => formatSize(this.info()?.size ?? 0));

  constructor() {
    afterNextRender(() => this.openPicker());
    inject(DestroyRef).onDestroy(() => this.manager.cancel());
  }

  /** Abre el selector de archivos; si el navegador exige un gesto del usuario, queda el botón. */
  protected openPicker(): void {
    try {
      this.fileInput().nativeElement.click();
    } catch {
      // Sin activación del usuario el navegador lo bloquea: el botón «Elegir archivo» lo reintenta.
    }
  }

  /** Atiende la elección del archivo; si no se eligió ninguno, no inicia ninguna transferencia. */
  protected async onFileChosen(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (file && !this.busy()) {
      await this.start(file);
    }
  }

  /** Cancela el envío sin confirmación; la copia ya guardada se conserva. */
  protected cancel(): void {
    this.manager.cancel();
    this.info.set(null);
    this.error.set(null);
  }

  private async start(file: File): Promise<void> {
    this.manager.cancel();
    this.info.set(null);
    this.error.set(null);
    const validation = this.validator.validate(file.size);
    if (!validation.ok) {
      this.error.set(validation.message);
      return;
    }
    this.busy.set(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const fragments = await fragmentFile({ name: file.name, type: file.type, bytes });
      await this.storage.save('sent', { name: file.name, type: file.type, bytes });
      this.info.set({
        name: file.name,
        type: file.type || $localize`desconocido`,
        size: file.size,
        totalQr: countFragments(file.size),
      });
      this.manager.start(fragments);
    } catch (error) {
      this.error.set(
        error instanceof StorageQuotaError
          ? $localize`No hay espacio de almacenamiento suficiente para guardar la copia del archivo. Libera espacio e inténtalo de nuevo.`
          : $localize`No se pudo preparar el envío. Inténtalo de nuevo.`,
      );
    } finally {
      this.busy.set(false);
    }
  }
}
