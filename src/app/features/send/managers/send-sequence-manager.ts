import { Service, computed, inject, signal } from '@angular/core';
import { IDLE_SEND_PROGRESS, SendProgress } from '@/features/send/models/send-progress';
import { FRAMES_PER_SECOND, SPEED_OPTIONS } from '@/features/send/models/send-speed';
import { QrEncoder, QrMatrix } from '@/features/send/services/qr-encoder';
import { SendPreferences } from '@/features/send/services/send-preferences';

export { FRAMES_PER_SECOND, SPEED_OPTIONS };

/** Duración de cada QR en milisegundos a la velocidad por defecto. */
export const FRAME_INTERVAL_MS = 1000 / FRAMES_PER_SECOND;
/** Tiempo que se retiene el primer QR al reiniciar la vuelta, para que el receptor pueda capturarlo. */
export const RESTART_HOLD_MS = 3000;

/**
 * Orquesta la emisión de la secuencia de QR: deja fijo el primer QR hasta que el usuario lo toque
 * ({@link SendSequenceManager.restartLap}) o elija desde qué QR seguir ({@link SendSequenceManager.seekTo});
 * desde entonces muestra un QR por fragmento a la velocidad elegida ({@link SendSequenceManager.setSpeed}),
 * repite la secuencia en bucle hasta que se cancele y libera sus recursos al cancelar.
 *
 * @example
 * ```typescript
 * const manager = inject(SendSequenceManager);
 * manager.start(fragments); // primer QR fijo, esperando el toque
 * manager.restartLap(); // el usuario toca el QR: la secuencia arranca
 * // ...
 * manager.cancel();
 * ```
 *
 * @since 1.0.0
 */
@Service()
export class SendSequenceManager {
  private readonly encoder = inject(QrEncoder);
  private readonly preferences = inject(SendPreferences);

  private readonly state = signal<SendProgress>(IDLE_SEND_PROGRESS);
  private readonly matrix = signal<QrMatrix | null>(null);

  private fragments: readonly Uint8Array[] = [];
  private timer: ReturnType<typeof setTimeout> | undefined;
  private startedAt = 0;
  private emitted = 0;
  private holdUntil = 0;
  /** QR por segundo: el que el usuario eligió la última vez, si lo hay. */
  private readonly fps = signal<number>(this.preferences.speed());
  private readonly intervalMs = computed(() => 1000 / this.fps());

  /** Estado de la emisión (activa, fragmento actual, vuelta, total y tiempo estimado por vuelta). */
  public readonly progress = this.state.asReadonly();
  /** Matriz del QR que se debe mostrar ahora, o `null` si no hay emisión. */
  public readonly currentQr = this.matrix.asReadonly();
  /** QR por segundo con los que se emite la secuencia. */
  public readonly speed = this.fps.asReadonly();
  /** Si la emisión está en curso. */
  public readonly active = computed(() => this.state().active);

  /**
   * Prepara la emisión: muestra el primer QR fijo, sin avanzar, hasta que el usuario lo toque. Si ya
   * había una emisión en curso, la cancela primero.
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
    this.matrix.set(this.encoder.encode(fragments[0]));
    this.state.set({
      active: true,
      waiting: true,
      index: 0,
      total: fragments.length,
      lap: 1,
      estimatedLapMs: this.lapMs(),
    });
  }

  /**
   * Cambia la velocidad de la secuencia (QR por segundo). Con la emisión en marcha, el QR en pantalla
   * se mantiene (y su retención, si la hay) y el siguiente llega con el nuevo intervalo; el tiempo por
   * vuelta se recalcula.
   *
   * @param framesPerSecond - Velocidad elegida; debe ser positiva.
   */
  public setSpeed(framesPerSecond: number): void {
    if (!(framesPerSecond > 0)) {
      return;
    }
    this.fps.set(framesPerSecond);
    this.preferences.saveSpeed(framesPerSecond);
    const current = this.state();
    if (this.fragments.length === 0) {
      return;
    }
    this.state.set({ ...current, estimatedLapMs: this.lapMs() });
    if (current.waiting) {
      return;
    }
    clearTimeout(this.timer);
    const now = performance.now();
    const wait = Math.max(this.holdUntil - now, this.intervalMs());
    this.emitted = 1;
    this.startedAt = now + wait - this.intervalMs();
    this.schedule(current.index, current.lap);
  }

  /**
   * Inicia o reinicia la vuelta: muestra el primer QR y lo retiene {@link RESTART_HOLD_MS} antes de
   * seguir con la cadencia normal. Es el primer toque del usuario el que arranca la secuencia. No hace
   * nada si no hay emisión en curso.
   */
  public restartLap(): void {
    this.jumpTo(0, 1);
  }

  /**
   * Continúa la secuencia desde el fragmento indicado: lo muestra, lo retiene {@link RESTART_HOLD_MS}
   * para que el receptor pueda capturarlo y sigue con la cadencia normal desde ahí. Mantiene la vuelta
   * en curso (la primera si aún esperaba el primer toque). No hace nada si no hay emisión en curso.
   *
   * @param index - Posición (desde 0) del fragmento; se acota al rango de la secuencia.
   */
  public seekTo(index: number): void {
    const lap = this.state().waiting ? 1 : this.state().lap;
    this.jumpTo(Math.min(Math.max(Math.trunc(index), 0), this.fragments.length - 1), lap);
  }

  private jumpTo(index: number, lap: number): void {
    if (this.fragments.length === 0) {
      return;
    }
    clearTimeout(this.timer);
    this.emitted = 0;
    this.startedAt = performance.now() + RESTART_HOLD_MS - this.intervalMs();
    this.holdUntil = performance.now() + RESTART_HOLD_MS;
    this.show(index, lap);
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
      waiting: false,
      index,
      total,
      lap,
      estimatedLapMs: this.lapMs(),
    });
    this.schedule(index, lap);
  }

  /** Tiempo hasta haber mostrado cada fragmento una vez: la vuelta completa. */
  private lapMs(): number {
    return this.fragments.length * this.intervalMs();
  }

  /** Programa el QR siguiente al que se muestra ahora (`index`, de la vuelta `lap`). */
  private schedule(index: number, lap: number): void {
    const total = this.fragments.length;
    // La cadencia se mide contra el inicio para que el retraso de un fotograma no se acumule.
    const nextAt = this.startedAt + this.emitted * this.intervalMs();
    const delay = Math.max(0, nextAt - performance.now());
    const next = (index + 1) % total;
    this.timer = setTimeout(() => this.show(next, next === 0 ? lap + 1 : lap), delay);
  }
}
