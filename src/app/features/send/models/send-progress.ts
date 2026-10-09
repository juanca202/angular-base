/**
 * Estado de la emisión de la secuencia de QR.
 *
 * @since 1.0.0
 */
export interface SendProgress {
  /** Si hay una emisión en curso (esperando el primer toque o emitiendo). */
  readonly active: boolean;
  /** Si el primer QR está fijo a la espera de que el usuario lo toque para iniciar la secuencia. */
  readonly waiting: boolean;
  /** Posición (desde 0) del fragmento que se muestra, que avanza en orden. */
  readonly index: number;
  /** Cantidad total de QR de la secuencia. */
  readonly total: number;
  /** Vuelta actual (desde 1); 0 mientras no haya empezado. */
  readonly lap: number;
  /**
   * Tiempo estimado, en milisegundos, en que cada fragmento se muestra al menos una vez: la vuelta
   * completa. `null` si no hay emisión.
   */
  readonly estimatedLapMs: number | null;
}

/** Estado inicial, sin emisión. */
export const IDLE_SEND_PROGRESS: SendProgress = {
  active: false,
  waiting: false,
  index: 0,
  total: 0,
  lap: 0,
  estimatedLapMs: null,
};
