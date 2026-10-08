/**
 * Error lanzado cuando la cuota de almacenamiento del navegador no alcanza para guardar un archivo.
 *
 * @since 1.0.0
 */
export class StorageQuotaError extends Error {
  /**
   * @param requiredBytes - Bytes que se intentaban guardar.
   * @param availableBytes - Bytes disponibles estimados (0 si se desconocen).
   */
  constructor(
    public readonly requiredBytes: number,
    public readonly availableBytes: number,
  ) {
    super(
      `Cuota de almacenamiento agotada: se requieren ${requiredBytes} B y hay ${availableBytes} B disponibles`,
    );
    this.name = 'StorageQuotaError';
  }
}
