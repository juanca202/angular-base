import {
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { Icon } from '@factor_ec/ui';
import { PrivateStorage } from '@/core/services/private-storage';
import { ScreenWakeLock } from '@/core/services/screen-wake-lock';
import { StorageQuotaError } from '@/core/services/storage-quota-error';
import { Sheet } from '@/shared/components/sheet/sheet';
import { FragmentBar } from '@/shared/components/fragment-bar/fragment-bar';
import { QrCanvas } from '@/features/send/components/qr-canvas';
import { SPEED_OPTIONS, SendSequenceManager } from '@/features/send/managers/send-sequence-manager';
import { SendFileValidator } from '@/features/send/services/send-file-validator';
import { formatSize } from '@/shared/utils/format-size';
import { DENSITY_OPTIONS } from '@/features/send/models/send-density';
import { SendPreferences } from '@/features/send/services/send-preferences';
import {
  FragmentAssembler,
  QrProtocolError,
  fragmentFile,
  type ProtocolFile,
} from '@/shared/utils/qr-protocol';

/** Datos del archivo que se muestran en la cabecera de la hoja. */
interface SendInfo {
  readonly name: string;
  readonly type: string;
  readonly size: number;
  /** Bytes que viajan por los QR; menos que `size` cuando el archivo se transmite comprimido. */
  readonly transferSize: number;
  readonly totalQr: number;
}

/** Formatea una duración en milisegundos como minutos y segundos. */
function formatDuration(ms: number): string {
  const seconds = Math.round(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  return minutes > 0 ? `${minutes} min ${seconds % 60} s` : `${seconds} s`;
}

/**
 * Hoja de envío sobre el inicio: abre el selector de un solo archivo, guarda una copia en el
 * almacenamiento privado, emite la secuencia de QR en bucle y muestra la información del archivo en
 * su cabecera. La densidad y la velocidad se eligen en el menú ⋮ de la cabecera. No muestra progreso
 * de transmisión porque el emisor no tiene canal de retorno; cerrar la hoja cancela el envío.
 *
 * @since 1.0.0
 */
@Component({
  selector: 'app-send-page',
  imports: [QrCanvas, FragmentBar, Sheet, Icon, MatButtonModule, MatMenuModule],
  templateUrl: './send-page.html',
  host: { class: 'block' },
})
export class SendPage {
  private readonly manager = inject(SendSequenceManager);
  private readonly storage = inject(PrivateStorage);
  private readonly validator = inject(SendFileValidator);
  private readonly preferences = inject(SendPreferences);
  private readonly wakeLock = inject(ScreenWakeLock);
  private readonly router = inject(Router);

  /** Archivo en curso, para volver a fragmentarlo si cambia el tamaño de fragmento. */
  private source: ProtocolFile | null = null;

  private readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly sending = this.manager.active;
  protected readonly densities = DENSITY_OPTIONS;
  /** Bytes de archivo por QR con los que se fragmenta el envío. */
  protected readonly dataSize = signal<number>(this.preferences.density());
  protected readonly currentQr = this.manager.currentQr;
  protected readonly speeds = SPEED_OPTIONS;
  protected readonly speed = this.manager.speed;
  protected readonly progress = this.manager.progress;
  protected readonly waiting = computed(() => this.progress().waiting);
  protected readonly info = signal<SendInfo | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly busy = signal(false);
  /** Si se acaba de cambiar la densidad: el receptor debe empezar de nuevo. */
  protected readonly densityNotice = signal(false);
  protected readonly lapTime = computed(() => {
    const ms = this.manager.progress().estimatedLapMs;
    return ms === null ? '' : formatDuration(ms);
  });
  protected readonly fileSize = computed(() => formatSize(this.info()?.size ?? 0));
  protected readonly transferSize = computed(() => formatSize(this.info()?.transferSize ?? 0));
  protected readonly compressed = computed(
    () => (this.info()?.transferSize ?? 0) < (this.info()?.size ?? 0),
  );

  constructor() {
    // La pantalla no debe apagarse ni atenuarse mientras se muestra la secuencia.
    effect(() => void (this.sending() ? this.wakeLock.acquire() : this.wakeLock.release()));
    inject(DestroyRef).onDestroy(() => {
      this.manager.cancel();
      void this.wakeLock.release();
    });
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

  /**
   * Inicia la secuencia con el primer toque y, en los siguientes, reinicia la vuelta; en ambos casos
   * retiene unos segundos el primer QR para que el receptor lo capture.
   */
  protected restartLap(): void {
    this.manager.restartLap();
  }

  /** Cambia la velocidad de la secuencia a la elegida en el menú. */
  protected changeSpeed(framesPerSecond: number): void {
    this.manager.setSpeed(framesPerSecond);
  }

  /**
   * Cambia el tamaño de fragmento y vuelve a fragmentar el archivo. Es una transferencia nueva (otros
   * fragmentos y otro identificador): vuelve a esperar el primer toque y el receptor debe empezar de
   * nuevo. Si no se puede (nombre largo para fragmentos pequeños, archivo grande para fragmentos
   * pequeños), se avisa y se conserva la transferencia y el tamaño actuales.
   */
  protected async changeDensity(size: number): Promise<void> {
    const source = this.source;
    if (!source || this.busy() || size === this.dataSize()) {
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    try {
      const validation = this.validator.validate(source.bytes.length, size);
      if (!validation.ok) {
        this.error.set(validation.message);
        return;
      }
      const fragments = await fragmentFile(source, { dataSize: size });
      this.dataSize.set(size);
      this.preferences.saveDensity(size);
      this.present(source, fragments);
      this.densityNotice.set(true);
    } catch (error) {
      this.error.set(
        error instanceof QrProtocolError && error.code === 'metadata-too-large'
          ? $localize`El nombre del archivo es demasiado largo para fragmentos tan pequeños. Elige un tamaño de fragmento mayor.`
          : $localize`No se pudo cambiar el tamaño de fragmento. Inténtalo de nuevo.`,
      );
    } finally {
      this.busy.set(false);
    }
  }

  /** Continúa la secuencia desde el fragmento elegido en la barra. */
  protected seek(index: number): void {
    this.manager.seekTo(index);
  }

  /** Se cerró el selector sin elegir archivo: no se inicia ninguna transferencia y se vuelve al inicio. */
  protected onPickerCancelled(): void {
    if (!this.sending() && !this.busy()) {
      void this.router.navigateByUrl('/');
    }
  }

  /** Cierra la hoja: cancela el envío sin confirmación (la copia ya guardada se conserva). */
  protected close(): void {
    this.manager.cancel();
    this.source = null;
    this.info.set(null);
    this.error.set(null);
    this.densityNotice.set(false);
    void this.router.navigateByUrl('/');
  }

  /** Muestra los datos del archivo y deja el primer QR fijo, a la espera del primer toque. */
  private present(source: ProtocolFile, fragments: Uint8Array[]): void {
    const assembler = new FragmentAssembler();
    assembler.accept(fragments[0]);
    this.info.set({
      name: source.name,
      type: source.type || $localize`desconocido`,
      size: source.bytes.length,
      transferSize: assembler.metadata?.transferSize ?? source.bytes.length,
      totalQr: fragments.length,
    });
    this.manager.start(fragments);
  }

  private async start(file: File): Promise<void> {
    this.manager.cancel();
    this.source = null;
    this.info.set(null);
    this.error.set(null);
    this.densityNotice.set(false);
    const validation = this.validator.validate(file.size, this.dataSize());
    if (!validation.ok) {
      this.error.set(validation.message);
      return;
    }
    this.busy.set(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const source = { name: file.name, type: file.type, bytes };
      const fragments = await fragmentFile(source, { dataSize: this.dataSize() });
      await this.storage.save('sent', source);
      this.source = source;
      this.present(source, fragments);
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
