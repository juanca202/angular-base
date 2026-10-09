import { Service } from '@angular/core';
import { DEFAULT_DATA_SIZE, QrProtocolError, countFragments } from '@/shared/utils/qr-protocol';

/** Motivos por los que no se puede iniciar un envío. */
export type SendRejection = 'unsupported-browser' | 'empty-file' | 'too-many-fragments';

/** Resultado de validar el archivo elegido. */
export type SendValidation = { ok: true } | { ok: false; code: SendRejection; message: string };

/**
 * Valida que el navegador y el archivo elegido permitan iniciar un envío, con mensajes claros.
 *
 * @since 1.0.0
 */
@Service()
export class SendFileValidator {
  /**
   * Indica si el navegador dispone de lo necesario para enviar: almacenamiento privado (OPFS) y
   * `crypto.subtle` para el hash de integridad.
   *
   * @returns `true` si el navegador es compatible.
   */
  public isSupported(): boolean {
    return (
      typeof navigator !== 'undefined' &&
      typeof navigator.storage?.getDirectory === 'function' &&
      typeof crypto !== 'undefined' &&
      !!crypto.subtle
    );
  }

  /**
   * Valida el archivo elegido antes de leerlo.
   *
   * @param fileSize - Tamaño del archivo en bytes.
   * @param dataSize - Bytes de archivo por fragmento con los que se enviará.
   * @returns `{ ok: true }` o el motivo del rechazo con su mensaje.
   */
  public validate(fileSize: number, dataSize: number = DEFAULT_DATA_SIZE): SendValidation {
    if (!this.isSupported()) {
      return {
        ok: false,
        code: 'unsupported-browser',
        message: $localize`Este navegador no es compatible con el envío de archivos. Usa Chrome en Android.`,
      };
    }
    if (fileSize === 0) {
      return {
        ok: false,
        code: 'empty-file',
        message: $localize`El archivo está vacío: elige un archivo con contenido.`,
      };
    }
    try {
      countFragments(fileSize, dataSize);
    } catch (error) {
      if (error instanceof QrProtocolError && error.code === 'too-many-fragments') {
        return {
          ok: false,
          code: 'too-many-fragments',
          message: $localize`El archivo es demasiado grande para enviarlo por códigos QR. Elige uno más pequeño.`,
        };
      }
      throw error;
    }
    return { ok: true };
  }
}
