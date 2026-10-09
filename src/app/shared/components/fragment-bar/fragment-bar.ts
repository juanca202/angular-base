import {
  Component,
  ElementRef,
  computed,
  effect,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

/** Horizontal resolution of the canvas that paints the received fragments. */
const CANVAS_WIDTH = 1000;
/** Fragments the keyboard moves with Page Up / Page Down. */
const PAGE_STEP = 10;

/**
 * Horizontal bar that stands for the ordered fragments of a transfer, each one a slice of equal
 * width. It serves both ends of a transfer:
 *
 * - On the sender it shows where in the lap the sequence is, with a vertical marker, and is
 *   `interactive`: pressing or dragging it (or using the keyboard) emits `seek` with the fragment
 *   to continue from.
 * - On the receiver it paints the fragments already received, so what is still missing is visible.
 *
 * @example
 * ```html
 * <app-fragment-bar [total]="416" [current]="12" interactive (seek)="goTo($event)" />
 * <app-fragment-bar [total]="416" [received]="receivedSet" />
 * ```
 */
@Component({
  selector: 'app-fragment-bar',
  template: `
    <div
      class="relative h-4 w-full touch-none overflow-hidden rounded bg-gray-200 select-none"
      [class.cursor-pointer]="interactive()"
      [class.focus-visible:outline-2]="interactive()"
      [attr.role]="interactive() ? 'slider' : 'img'"
      [attr.tabindex]="interactive() ? 0 : null"
      [attr.aria-label]="label()"
      [attr.aria-valuemin]="interactive() ? 1 : null"
      [attr.aria-valuemax]="interactive() ? total() : null"
      [attr.aria-valuenow]="interactive() && shown() !== null ? shown()! + 1 : null"
      [attr.aria-valuetext]="interactive() ? valueText() : null"
      (pointerdown)="onPointerDown($event)"
      (pointermove)="onPointerMove($event)"
      (pointerup)="onPointerUp($event)"
      (pointercancel)="dragIndex.set(null)"
      (keydown)="onKeyDown($event)"
    >
      @if (received()) {
        <canvas
          #canvas
          class="absolute inset-0 size-full [image-rendering:pixelated]"
          aria-hidden="true"
        ></canvas>
      }
      @if (markerPercent() !== null) {
        <div
          class="pointer-events-none absolute inset-y-0 w-1 -translate-x-1/2 bg-blue-700 shadow-[0_0_0_1px_white]"
          [style.left.%]="markerPercent()"
          aria-hidden="true"
        ></div>
      }
    </div>
  `,
  host: { class: 'block' },
})
export class FragmentBar {
  /** Number of fragments the bar stands for. */
  public readonly total = input.required<number>();
  /** Position (from 0) of the fragment the marker points at, or `null` for no marker. */
  public readonly current = input<number | null>(null);
  /** Positions of the fragments already received, painted green, or `null` to paint none. */
  public readonly received = input<ReadonlySet<number> | null>(null);
  /** Whether the bar can be pressed, dragged or driven with the keyboard to choose a fragment. */
  public readonly interactive = input(false);
  /** Accessible name of the bar. */
  public readonly label = input($localize`Posición en la secuencia de QR`);
  /** The user chose the fragment (position from 0) to continue from. */
  public readonly seek = output<number>();

  protected readonly dragIndex = signal<number | null>(null);
  /** The fragment the marker shows: the one being dragged to, otherwise the current one. */
  protected readonly shown = computed(() => this.dragIndex() ?? this.current());
  protected readonly markerPercent = computed(() => {
    const shown = this.shown();
    const total = this.total();
    return shown === null || total <= 0 ? null : ((shown + 0.5) / total) * 100;
  });
  protected readonly valueText = computed(
    () => $localize`QR ${(this.shown() ?? 0) + 1}:position: de ${this.total()}:total:`,
  );

  private readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  constructor() {
    effect(() => this.paint(this.canvas()?.nativeElement, this.received(), this.total()));
  }

  protected onPointerDown(event: PointerEvent): void {
    if (!this.interactive()) {
      return;
    }
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
    this.dragIndex.set(this.indexAt(event));
  }

  protected onPointerMove(event: PointerEvent): void {
    if (this.dragIndex() !== null) {
      this.dragIndex.set(this.indexAt(event));
    }
  }

  protected onPointerUp(event: PointerEvent): void {
    if (this.dragIndex() === null) {
      return;
    }
    const index = this.indexAt(event);
    this.dragIndex.set(null);
    this.seek.emit(index);
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (!this.interactive()) {
      return;
    }
    const current = this.current() ?? 0;
    const target = this.keyTarget(event.key, current);
    if (target !== null) {
      event.preventDefault();
      this.seek.emit(Math.min(Math.max(target, 0), this.total() - 1));
    }
  }

  private keyTarget(key: string, current: number): number | null {
    switch (key) {
      case 'ArrowRight':
      case 'ArrowUp':
        return current + 1;
      case 'ArrowLeft':
      case 'ArrowDown':
        return current - 1;
      case 'PageUp':
        return current + PAGE_STEP;
      case 'PageDown':
        return current - PAGE_STEP;
      case 'Home':
        return 0;
      case 'End':
        return this.total() - 1;
      default:
        return null;
    }
  }

  /** Fragment under the pointer, from where it is along the bar. */
  private indexAt(event: PointerEvent): number {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const fraction = rect.width > 0 ? (event.clientX - rect.left) / rect.width : 0;
    const total = this.total();
    return Math.min(total - 1, Math.max(0, Math.floor(fraction * total)));
  }

  private paint(
    canvas: HTMLCanvasElement | undefined,
    received: ReadonlySet<number> | null,
    total: number,
  ): void {
    const context = canvas?.getContext('2d');
    if (!canvas || !context || !received || total <= 0) {
      return;
    }
    canvas.width = CANVAS_WIDTH;
    canvas.height = 1;
    context.clearRect(0, 0, CANVAS_WIDTH, 1);
    context.fillStyle = '#15803d';
    const slice = CANVAS_WIDTH / total;
    for (const index of received) {
      context.fillRect(Math.floor(index * slice), 0, Math.max(1, Math.ceil(slice)), 1);
    }
  }
}
