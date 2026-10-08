import { Service, computed, inject, signal } from '@angular/core';
import { IDLE_SEND_PROGRESS, SendProgress } from '@/features/send/models/send-progress';
import { QrEncoder, QrMatrix } from '@/features/send/services/qr-encoder';

/** Fotogramas por segundo de la secuencia (valor fijo, aún por validar con cámara). */
export const FRAMES_PER_SECOND = 8;
/** Duración de cada QR en milisegundos. */
export const FRAME_INTERVAL_MS = 1000 / FRAMES_PER_SECOND;
/** QR emitidos a partir de los cuales hay datos suficientes para estimar el tiempo por vuelta. */
const FRAMES_FOR_ESTIMATE = 2;

/**
 * Orquesta la emisión de la secuencia de QR: muestra un QR por fragmento a velocidad fija, repite la
 * secuencia en bucle hasta que se cancele y libera sus recursos al cancelar.
 *
 * @example
 * ```typescript
 * const manager = inject(SendSequenceManager);
 * manager.start(fragments);
 * // ...
 * manager.cancel();
 * ```
 *
 * @since 1.0.0
 */
@Service()
export class SendSequenceManager {
  private readonly encoder = inject(QrEncoder);

  private readonly state = signal<SendProgress>(IDLE_SEND_PROGRESS);
  private readonly matrix = signal<QrMatrix | null>(null);

  private fragments: readonly Uint8Array[] = [];
  private timer: ReturnType<typeof setTimeout> | undefined;
  private startedAt = 0;
  private emitted = 0;

  /** Estado de la emisión (activa, fragmento actual, vuelta, total y tiempo estimado por vuelta). */
  public readonly progress = this.state.asReadonly();
  /** Matriz del QR que se debe mostrar ahora, o `null` si no hay emisión. */
  public readonly currentQr = this.matrix.asReadonly();
  /** Si la emisión está en curso. */
  public readonly active = computed(() => this.state().active);

  /**
   * Inicia la emisión. Si ya había una en curso, la cancela primero.
   *
   * @param fragments - Fragmentos del protocolo, en orden.
   * @throws {Error} Si la lista de fragmentos está vacía.
   */
  public start(fragments: readonly Uint8Array[]): void {
    if (fragments.length === 0) {
      throw new Error('La secuencia no tiene fragmentos que emitir');
    }
    this.cancel();
    this.fragments = fragments;
    this.emitted = 0;
    this.startedAt = performance.now();
    this.show(0, 1);
  }

  /** Detiene la emisión, libera el temporizador y el QR en pantalla, y reinicia el estado. */
  public cancel(): void {
    clearTimeout(this.timer);
    this.timer = undefined;
    this.fragments = [];
    this.matrix.set(null);
    this.state.set(IDLE_SEND_PROGRESS);
  }

  private show(index: number, lap: number): void {
    const total = this.fragments.length;
    this.matrix.set(this.encoder.encode(this.fragments[index]));
    this.emitted++;
    this.state.set({
      active: true,
      index,
      total,
      lap,
      estimatedLapMs: this.emitted >= FRAMES_FOR_ESTIMATE ? total * FRAME_INTERVAL_MS : null,
    });
    // La cadencia se mide contra el inicio para que el retraso de un fotograma no se acumule.
    const nextAt = this.startedAt + this.emitted * FRAME_INTERVAL_MS;
    const delay = Math.max(0, nextAt - performance.now());
    const next = (index + 1) % total;
    this.timer = setTimeout(() => this.show(next, next === 0 ? lap + 1 : lap), delay);
  }
}
