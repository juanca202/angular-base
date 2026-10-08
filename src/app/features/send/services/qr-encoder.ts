import { Service } from '@angular/core';
import { create } from 'qrcode';

/**
 * Matriz de módulos de un QR.
 *
 * @since 1.0.0
 */
export interface QrMatrix {
  /** Cantidad de módulos por lado. */
  readonly size: number;
  /** Módulos en orden de filas; `1` es un módulo oscuro y `0` uno claro. */
  readonly modules: Uint8Array;
}

/**
 * Convierte un fragmento del protocolo en la matriz de módulos de un QR en modo binario con
 * corrección de errores M. No dibuja: el dibujo es responsabilidad de la interfaz.
 *
 * @since 1.0.0
 */
@Service()
export class QrEncoder {
  /**
   * Codifica un fragmento como QR.
   *
   * @param fragment - Bytes del fragmento.
   * @returns La matriz de módulos del QR.
   */
  public encode(fragment: Uint8Array): QrMatrix {
    const qr = create([{ data: fragment, mode: 'byte' }], { errorCorrectionLevel: 'M' });
    return { size: qr.modules.size, modules: Uint8Array.from(qr.modules.data) };
  }
}
