import { BreakpointObserver } from '@angular/cdk/layout';
import {
  Component,
  DestroyRef,
  TemplateRef,
  afterNextRender,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

/** Ancho a partir del cual la hoja se muestra como diálogo en lugar de panel inferior. */
const DESKTOP_QUERY = '(min-width: 768px)';

/**
 * Hoja de contenido sobre la pantalla de inicio: `mat-bottomsheet` en móvil y `mat-dialog` centrado
 * en escritorio, con el fondo atenuado. Se cierra al tocar fuera de ella o con Escape; el foco queda
 * dentro mientras está abierta. El contenedor se elige al abrirse según el ancho de pantalla.
 *
 * @example
 * ```html
 * <app-sheet label="Enviar archivo" (dismissed)="close()">…</app-sheet>
 * ```
 */
@Component({
  selector: 'app-sheet',
  template: `
    <ng-template #content>
      <div class="flex max-h-[92dvh] flex-col gap-4 overflow-y-auto p-4">
        <ng-content />
      </div>
    </ng-template>
  `,
  host: { class: 'contents' },
})
export class Sheet {
  private readonly dialog = inject(MatDialog);
  private readonly bottomSheet = inject(MatBottomSheet);
  private readonly breakpoints = inject(BreakpointObserver);
  private readonly content = viewChild.required<TemplateRef<unknown>>('content');

  private closeOverlay?: () => void;
  private destroyed = false;

  /** Nombre accesible del diálogo. */
  public readonly label = input.required<string>();
  /** El usuario pidió cerrar la hoja (tocó fuera de ella o pulsó Escape). */
  public readonly dismissed = output<void>();
  /** La hoja ya está abierta y su contenido en el DOM (el foco y la cámara pueden iniciarse). */
  public readonly opened = output<void>();

  constructor() {
    afterNextRender(() => this.open());
    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      this.closeOverlay?.();
    });
  }

  private open(): void {
    const template = this.content();
    const ariaLabel = this.label();
    const isDesktop = this.breakpoints.isMatched(DESKTOP_QUERY);
    let closed: Observable<unknown>;
    if (isDesktop) {
      const ref = this.dialog.open(template, { ariaLabel, width: '36rem', maxWidth: '100vw' });
      this.closeOverlay = () => ref.close();
      closed = ref.afterClosed();
    } else {
      const ref = this.bottomSheet.open(template, { ariaLabel });
      this.closeOverlay = () => ref.dismiss();
      closed = ref.afterDismissed();
    }
    this.opened.emit();
    closed.subscribe(() => {
      if (!this.destroyed) {
        this.dismissed.emit();
      }
    });
  }
}
