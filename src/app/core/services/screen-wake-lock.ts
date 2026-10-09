import { Service } from '@angular/core';

/**
 * Mantiene la pantalla encendida mientras dura una transferencia, para que ni el emisor muestre una
 * pantalla atenuada o apagada ni el receptor pierda la imagen de la cámara en mitad de la secuencia.
 *
 * Usa la API Screen Wake Lock cuando el navegador la ofrece; si no, o si la rechaza (batería baja,
 * pestaña oculta), no hace nada y la transferencia sigue. El sistema libera el bloqueo al ocultarse la
 * pestaña, así que se vuelve a pedir al volver a verla mientras siga haciendo falta.
 *
 * @example
 * ```typescript
 * const wakeLock = inject(ScreenWakeLock);
 * await wakeLock.acquire(); // empieza la transferencia
 * await wakeLock.release(); // termina o se cancela
 * ```
 *
 * @since 1.0.0
 */
@Service()
export class ScreenWakeLock {
  private sentinel: WakeLockSentinel | null = null;
  private wanted = false;

  constructor() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          void this.request();
        }
      });
    }
  }

  /** Pide mantener la pantalla encendida hasta que se llame a {@link ScreenWakeLock.release}. */
  public async acquire(): Promise<void> {
    this.wanted = true;
    await this.request();
  }

  /** Deja de pedir que la pantalla siga encendida. Es seguro llamarlo sin haber pedido nada. */
  public async release(): Promise<void> {
    this.wanted = false;
    const sentinel = this.sentinel;
    this.sentinel = null;
    try {
      await sentinel?.release();
    } catch {
      // Ya liberado por el sistema: no hay nada más que hacer.
    }
  }

  private async request(): Promise<void> {
    if (!this.wanted || this.sentinel || typeof navigator === 'undefined' || !navigator.wakeLock) {
      return;
    }
    try {
      const sentinel = await navigator.wakeLock.request('screen');
      if (!this.wanted || this.sentinel) {
        // Se dejó de necesitar (o ya hay otro) mientras el navegador respondía.
        await sentinel.release();
        return;
      }
      this.sentinel = sentinel;
      sentinel.addEventListener('release', () => {
        if (this.sentinel === sentinel) {
          this.sentinel = null;
        }
      });
    } catch {
      // Denegado (batería baja, pestaña oculta): la transferencia sigue sin esta ayuda.
    }
  }
}
