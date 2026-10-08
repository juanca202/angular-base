/** Dirección de una transferencia: enviada por este dispositivo o recibida desde otro. */
export type TransferDirection = 'sent' | 'received';

/**
 * Registro de una transferencia guardada en el almacenamiento privado de la aplicación.
 *
 * @since 1.0.0
 */
export interface StoredTransfer {
  /** Identificador único del registro. */
  readonly id: string;
  /** Si el archivo fue enviado o recibido. */
  readonly direction: TransferDirection;
  /** Nombre original del archivo. */
  readonly name: string;
  /** Tipo MIME del archivo (vacío si se desconoce). */
  readonly type: string;
  /** Tamaño del archivo en bytes. */
  readonly size: number;
  /** Fecha de la transferencia, en milisegundos desde la época Unix. */
  readonly date: number;
}
