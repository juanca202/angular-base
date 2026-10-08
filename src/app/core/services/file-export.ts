import { Service } from '@angular/core';

/**
 * Servicio global que exporta un archivo del historial con su nombre original, por descarga o
 * compartiéndolo con otras aplicaciones del dispositivo.
 *
 * La exportación es la única salida de archivos de la aplicación y solo se inicia al llamar
 * explícitamente a {@link FileExport.download} o {@link FileExport.share}, desde una acción del
 * usuario. El nombre no se modifica: se exporta tal como se guardó.
 *
 * @example
 * ```typescript
 * const fileExport = inject(FileExport);
 * if (fileExport.canShare(file)) {
 *   await fileExport.share(file);
 * } else {
 *   fileExport.download(file);
 * }
 * ```
 *
 * @since 1.0.0
 */
@Service()
export class FileExport {
  /**
   * Descarga el archivo con su nombre original y libera la URL de objeto al terminar.
   *
   * @param file - Archivo a descargar.
   */
  public download(file: File): void {
    const url = URL.createObjectURL(file);
    try {
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = file.name;
      anchor.click();
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Indica si el navegador ofrece la opción de compartir archivos, para decidir si la interfaz
   * muestra la acción. Que un archivo concreto se pueda compartir se comprueba con {@link canShare}.
   *
   * @returns `true` si el navegador expone `navigator.share` y `navigator.canShare`.
   */
  public isShareAvailable(): boolean {
    return typeof navigator.share === 'function' && typeof navigator.canShare === 'function';
  }

  /**
   * Indica si el navegador permite compartir este archivo con otras aplicaciones, para que la
   * interfaz ofrezca solo las opciones posibles.
   *
   * @param file - Archivo que se quiere compartir.
   * @returns `true` si el navegador admite compartir archivos y acepta este.
   */
  public canShare(file: File): boolean {
    return (
      typeof navigator.share === 'function' && navigator.canShare?.({ files: [file] }) === true
    );
  }

  /**
   * Comparte el archivo con otras aplicaciones del dispositivo.
   *
   * Cerrar la hoja de compartir sin elegir aplicación es una cancelación sin efectos: no lanza
   * error y el historial queda intacto.
   *
   * @param file - Archivo a compartir.
   * @returns `true` si se compartió; `false` si el usuario canceló.
   * @throws Cualquier error de compartir que no sea una cancelación.
   */
  public async share(file: File): Promise<boolean> {
    try {
      await navigator.share({ files: [file] });
      return true;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return false;
      }
      throw error;
    }
  }
}
