/**
 * Estado de la emisión de la secuencia de QR.
 *
 * @since 1.0.0
 */
export interface SendProgress {
  /** Si la secuencia se está emitiendo. */
  readonly active: boolean;
  /** Posición (desde 0) del fragmento que se muestra. */
  readonly index: number;
  /** Cantidad total de QR de la secuencia. */
  readonly total: number;
  /** Vuelta actual (desde 1); 0 mientras no haya empezado. */
  readonly lap: number;
  /** Tiempo estimado por vuelta en milisegundos, o `null` mientras no haya datos suficientes. */
  readonly estimatedLapMs: number | null;
}

/** Estado inicial, sin emisión. */
export const IDLE_SEND_PROGRESS: SendProgress = {
  active: false,
  index: 0,
  total: 0,
  lap: 0,
  estimatedLapMs: null,
};
