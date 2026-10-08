import { Component, ElementRef, effect, input, viewChild } from '@angular/core';
import { QrMatrix } from '@/features/send/services/qr-encoder';

/** Módulos claros alrededor del QR exigidos por la especificación (zona de silencio). */
const QUIET_ZONE = 4;
/** Píxeles de lienzo por módulo; el lienzo se escala por CSS al ancho disponible. */
const PIXELS_PER_MODULE = 6;

/**
 * Dibuja la matriz de un QR en un canvas con fondo blanco y zona de silencio.
 *
 * @since 1.0.0
 */
@Component({
  selector: 'app-qr-canvas',
  template: `
    <canvas
      #canvas
      role="img"
      i18n-aria-label
      aria-label="Código QR del archivo"
      class="aspect-square w-full [image-rendering:pixelated]"
    ></canvas>
  `,
  host: { class: 'block' },
})
export class QrCanvas {
  /** Matriz a dibujar; `null` limpia el lienzo. */
  public readonly matrix = input<QrMatrix | null>(null);

  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  constructor() {
    effect(() => this.draw(this.matrix()));
  }

  private draw(matrix: QrMatrix | null): void {
    const canvas = this.canvas().nativeElement;
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }
    if (!matrix) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    const side = (matrix.size + QUIET_ZONE * 2) * PIXELS_PER_MODULE;
    canvas.width = side;
    canvas.height = side;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, side, side);
    context.fillStyle = '#000000';
    for (let row = 0; row < matrix.size; row++) {
      for (let col = 0; col < matrix.size; col++) {
        if (matrix.modules[row * matrix.size + col]) {
          context.fillRect(
            (col + QUIET_ZONE) * PIXELS_PER_MODULE,
            (row + QUIET_ZONE) * PIXELS_PER_MODULE,
            PIXELS_PER_MODULE,
            PIXELS_PER_MODULE,
          );
        }
      }
    }
  }
}
