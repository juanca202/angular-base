import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { QrMatrix } from '@/features/send/services/qr-encoder';

/** Módulos claros alrededor del QR exigidos por la especificación (zona de silencio). */
const QUIET_ZONE = 4;
/** Píxeles de lienzo por módulo mientras no se conoce el espacio disponible. */
const FALLBACK_PIXELS_PER_MODULE = 6;

/**
 * Dibuja la matriz de un QR en un canvas con fondo blanco y zona de silencio.
 *
 * El QR se dibuja con un número entero de píxeles **del dispositivo** por módulo, el mayor que cabe en
 * el ancho disponible, y el lienzo se muestra a ese mismo tamaño: sin escalado intermedio por CSS cada
 * módulo mide exactamente lo mismo, sin bordes borrosos ni módulos de anchos desiguales, que es lo que
 * más ayuda a la cámara a leer un QR denso.
 *
 * @since 1.0.0
 */
@Component({
  selector: 'app-qr-canvas',
  template: `
    <canvas
      #canvas
      role="img"
      [attr.aria-label]="label()"
      class="block aspect-square max-w-full [image-rendering:pixelated]"
    ></canvas>
  `,
  host: { class: 'flex items-center justify-center' },
})
export class QrCanvas {
  /** Matriz a dibujar; `null` limpia el lienzo. */
  public readonly matrix = input<QrMatrix | null>(null);
  /** Nombre accesible del QR. */
  public readonly label = input($localize`Código QR del archivo`);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly destroyRef = inject(DestroyRef);
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  /** Ancho disponible, en píxeles CSS; 0 mientras no se ha medido. */
  private readonly width = signal(0);

  constructor() {
    afterNextRender(() => {
      this.width.set(this.host.clientWidth);
      if (typeof ResizeObserver === 'function') {
        const observer = new ResizeObserver(() => this.width.set(this.host.clientWidth));
        observer.observe(this.host);
        this.destroyRef.onDestroy(() => observer.disconnect());
      }
    });
    effect(() => this.draw(this.matrix(), this.width()));
  }

  private draw(matrix: QrMatrix | null, width: number): void {
    const canvas = this.canvas().nativeElement;
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }
    if (!matrix) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    const modules = matrix.size + QUIET_ZONE * 2;
    const ratio = globalThis.devicePixelRatio || 1;
    // Píxeles de dispositivo por módulo: entero, y al menos 1 aunque el espacio sea muy pequeño.
    const scale =
      width > 0 ? Math.max(1, Math.floor((width * ratio) / modules)) : FALLBACK_PIXELS_PER_MODULE;
    const side = modules * scale;
    canvas.width = side;
    canvas.height = side;
    // Un píxel de lienzo es un píxel de dispositivo: se muestra a ese tamaño, sin escalar.
    canvas.style.width = width > 0 ? `${side / ratio}px` : '';
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, side, side);
    context.fillStyle = '#000000';
    for (let row = 0; row < matrix.size; row++) {
      for (let col = 0; col < matrix.size; col++) {
        if (matrix.modules[row * matrix.size + col]) {
          context.fillRect((col + QUIET_ZONE) * scale, (row + QUIET_ZONE) * scale, scale, scale);
        }
      }
    }
  }
}
