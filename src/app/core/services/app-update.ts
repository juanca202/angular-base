import { InjectionToken, Service, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { SwUpdate } from '@angular/service-worker';

/** Recarga la página; se inyecta para poder sustituirla en las pruebas. */
export const RELOAD_PAGE = new InjectionToken<() => void>('RELOAD_PAGE', {
  factory: () => () => location.reload(),
});

/**
 * Mantiene la aplicación en su versión más reciente sin dejar al usuario con una caché obsoleta.
 *
 * Estrategia: el service worker descarga en segundo plano cada versión nueva (`prefetch`), este
 * servicio la busca al arrancar y cada vez que la aplicación vuelve a primer plano, y la activa
 * recargando solo cuando el usuario lo acepta (nunca en mitad de un envío). Si el service worker
 * queda en un estado irrecuperable, recarga para descartar la caché dañada.
 *
 * @since 1.0.0
 */
@Service()
export class AppUpdate {
  private readonly swUpdate = inject(SwUpdate);
  private readonly document = inject(DOCUMENT);
  private readonly reload = inject(RELOAD_PAGE);
  private watching = false;

  /** Empieza a vigilar nuevas versiones; sin service worker activo (p. ej. en desarrollo) no hace nada. */
  public watch(): void {
    if (!this.swUpdate.isEnabled || this.watching) {
      return;
    }
    this.watching = true;
    this.swUpdate.unrecoverable.subscribe(() => this.reload());
    this.document.addEventListener('visibilitychange', () => {
      if (this.document.visibilityState === 'visible') {
        this.swUpdate.checkForUpdate().catch(() => undefined);
      }
    });
  }

  /**
   * Activa la versión descargada y recarga la página para usarla.
   *
   * @returns Una promesa que se resuelve al pedir la recarga.
   */
  public async activate(): Promise<void> {
    if (this.swUpdate.isEnabled) {
      await this.swUpdate.activateUpdate().catch(() => false);
    }
    this.reload();
  }
}
