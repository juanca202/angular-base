import { NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Icon } from '@factor_ec/ui';
import { TransferHistory } from '@/core/services/transfer-history';
import { HistoryPanel } from '@/shared/components/history-panel/history-panel';

/**
 * Pantalla de inicio: cabecera, tarjetas Enviar y Recibir (lado a lado en escritorio, apiladas en
 * móvil) y debajo la actividad reciente. Enviar y Recibir se abren como hoja sobre esta pantalla, en
 * la salida del router.
 *
 * @since 1.0.0
 */
@Component({
  selector: 'app-home-page',
  imports: [NgOptimizedImage, MatCardModule, RouterLink, RouterOutlet, Icon, HistoryPanel],
  templateUrl: './home-page.html',
  host: { class: 'block' },
})
export class HomePage {
  private readonly history = inject(TransferHistory);

  /** Al cerrarse la hoja de enviar o recibir, el historial puede tener una entrada nueva. */
  protected refreshHistory(): void {
    void this.history.load().catch(() => undefined);
  }
}
