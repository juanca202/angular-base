import {
  Component,
  DestroyRef,
  afterNextRender,
  computed,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { FileExport } from '@/core/services/file-export';
import { ScreenWakeLock } from '@/core/services/screen-wake-lock';
import { HistoryPanel } from '@/shared/components/history-panel/history-panel';
import { ReceiveSuccess } from '@/features/receive/components/receive-success';
import { FilePreview } from '@/features/receive/components/file-preview';
import { FailedReceiveResult, ResultCard } from '@/features/receive/components/result-card';
import { CameraErrorCode } from '@/features/receive/models/camera-error';
import { CameraView } from '@/features/receive/components/camera-view';
import { ReceiveProgressInfo } from '@/features/receive/components/receive-progress';
import { ReceiveDiagnostics } from '@/features/receive/services/receive-diagnostics';
import { ReceiveManager } from '@/features/receive/services/receive-manager';

/** Short description of the browser from its user agent: its name and version, and the device if it is shown. */
function describeBrowser(userAgent: string): string {
  const browser = /(Chrome|Chromium|Edg|Firefox|Version)\/([\d.]+)/.exec(userAgent);
  const device = /Android [\d.]+; ([^)]+)\)/.exec(userAgent);
  return [browser ? `${browser[1]} ${browser[2]}` : userAgent, device?.[1]]
    .filter(Boolean)
    .join(' · ');
}

/** Message shown for each reason why the camera cannot be used. */
const CAMERA_MESSAGES: Record<CameraErrorCode, string> = {
  'permission-denied': $localize`Necesitamos permiso para usar la cámara. Concédelo en el navegador y pulsa «Reintentar».`,
  'no-camera': $localize`No se encontró una cámara en este dispositivo.`,
  unsupported: $localize`Este navegador no es compatible con la lectura de códigos QR con la cámara.`,
};

function toFile(received: { name: string; type: string; bytes: Uint8Array<ArrayBuffer> }): File {
  return new File([received.bytes], received.name, { type: received.type });
}

/**
 * Reception screen: opens the camera on entering and shows what is being received. The reception
 * itself is driven by {@link ReceiveManager}; leaving the screen cancels it.
 *
 * @since 1.0.0
 */
@Component({
  selector: 'app-receive-page',
  imports: [
    CameraView,
    ReceiveProgressInfo,
    ResultCard,
    FilePreview,
    ReceiveSuccess,
    HistoryPanel,
    MatButtonModule,
    RouterLink,
  ],
  templateUrl: './receive-page.html',
  host: { class: 'block' },
})
export class ReceivePage {
  private readonly manager = inject(ReceiveManager);
  private readonly router = inject(Router);
  private readonly fileExport = inject(FileExport);
  private readonly diagnostics = inject(ReceiveDiagnostics);
  private readonly wakeLock = inject(ScreenWakeLock);
  private readonly camera = viewChild.required(CameraView);

  /** Reading counters, shown only when the page is opened with `?debug`. */
  protected readonly debug = inject(ActivatedRoute).snapshot.queryParamMap.has('debug');
  protected readonly stats = this.diagnostics.state;
  /** Browser and device as the page sees them (for `?debug`): Chrome version and the Android model. */
  protected readonly browser = describeBrowser(navigator.userAgent);
  protected readonly phase = this.manager.phase;
  protected readonly progress = this.manager.progress;
  protected readonly result = this.manager.result;
  /** The saved file, once the reception completed. */
  protected readonly completedFile = computed(() => {
    const result = this.result();
    return result?.outcome === 'completed' ? toFile(result.file) : null;
  });
  /** The result card to show when the reception did not end in a saved file. */
  protected readonly failure = computed<FailedReceiveResult | null>(() => {
    const result = this.result();
    return result && result.outcome !== 'completed' ? result : null;
  });
  protected readonly cameraMessage = computed(() => {
    const code = this.manager.cameraError();
    return code ? CAMERA_MESSAGES[code] : null;
  });
  /** Si la cámara está abriéndose o leyendo, es decir, mientras la pantalla debe seguir encendida. */
  private readonly reading = computed(() =>
    ['starting', 'reading', 'finishing'].includes(this.phase()),
  );
  protected readonly busy = computed(
    () => this.phase() === 'starting' || this.phase() === 'finishing',
  );

  constructor() {
    afterNextRender(() => void this.start());
    // La pantalla no debe apagarse mientras la cámara lee la secuencia (hasta tener un resultado).
    effect(() => void (this.reading() ? this.wakeLock.acquire() : this.wakeLock.release()));
    inject(DestroyRef).onDestroy(() => {
      this.manager.cancel();
      void this.wakeLock.release();
    });
  }

  /** Starts (or retries) the reading with the camera. A reading already in progress is not restarted. */
  protected async start(): Promise<void> {
    await this.manager.start(this.camera().video);
  }

  /** The user ends the reading; with fragments missing the result is «incomplete». */
  protected finishReading(): Promise<void> {
    return this.manager.finishReading();
  }

  /** Cancels without confirmation and goes back to the start screen. */
  protected async cancel(): Promise<void> {
    this.manager.cancel();
    await this.router.navigateByUrl('/');
  }

  /** After «incomplete», reads again keeping the valid fragments already received. */
  protected continueScanning(): Promise<void> {
    return this.manager.continueScanning();
  }

  /** After an error, starts over from scratch. */
  protected retry(): Promise<void> {
    return this.manager.retry();
  }

  /** Downloads the verified file that could not be saved. */
  protected downloadUnsaved(): void {
    const result = this.result();
    if (result?.outcome === 'storage-full' || result?.outcome === 'save-failed') {
      this.fileExport.download(toFile(result.file));
    }
  }
}
