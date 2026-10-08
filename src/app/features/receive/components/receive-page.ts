import { Component, DestroyRef, afterNextRender, computed, inject, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { CameraErrorCode } from '@/features/receive/models/camera-error';
import { CameraView } from '@/features/receive/components/camera-view';
import { ReceiveProgressInfo } from '@/features/receive/components/receive-progress';
import { TransferConfirmation } from '@/features/receive/components/transfer-confirmation';
import { ReceiveManager } from '@/features/receive/services/receive-manager';

/** Message shown for each reason why the camera cannot be used. */
const CAMERA_MESSAGES: Record<CameraErrorCode, string> = {
  'permission-denied': $localize`Necesitamos permiso para usar la cámara. Concédelo en el navegador y pulsa «Reintentar».`,
  'no-camera': $localize`No se encontró una cámara en este dispositivo.`,
  unsupported: $localize`Este navegador no es compatible con la lectura de códigos QR con la cámara.`,
};

/**
 * Reception screen: opens the camera on entering, shows what is being received and asks to confirm
 * the transfer. The reception itself is driven by {@link ReceiveManager}; leaving the screen cancels it.
 *
 * @since 1.0.0
 */
@Component({
  selector: 'app-receive-page',
  imports: [CameraView, ReceiveProgressInfo, TransferConfirmation, MatButtonModule],
  templateUrl: './receive-page.html',
  host: { class: 'block' },
})
export class ReceivePage {
  private readonly manager = inject(ReceiveManager);
  private readonly router = inject(Router);
  private readonly camera = viewChild.required(CameraView);

  protected readonly phase = this.manager.phase;
  protected readonly progress = this.manager.progress;
  protected readonly pending = this.manager.pending;
  protected readonly cameraMessage = computed(() => {
    const code = this.manager.cameraError();
    return code ? CAMERA_MESSAGES[code] : null;
  });
  protected readonly busy = computed(
    () => this.phase() === 'starting' || this.phase() === 'finishing',
  );

  constructor() {
    afterNextRender(() => void this.start());
    inject(DestroyRef).onDestroy(() => this.manager.cancel());
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

  protected confirm(): Promise<void> {
    return this.manager.confirm();
  }

  protected discard(): void {
    this.manager.discard();
  }
}
