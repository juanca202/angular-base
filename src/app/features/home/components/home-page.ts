import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { Icon } from '@factor_ec/ui';
import { HistoryPanel } from '@/shared/components/history-panel/history-panel';

/**
 * Pantalla de inicio: botones Enviar y Recibir, y debajo el historial de transferencias.
 *
 * @since 1.0.0
 */
@Component({
  selector: 'app-home-page',
  imports: [RouterLink, MatButtonModule, Icon, HistoryPanel],
  templateUrl: './home-page.html',
  host: { class: 'block' },
})
export class HomePage {}
