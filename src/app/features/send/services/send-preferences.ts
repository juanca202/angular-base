import { Service } from '@angular/core';
import { DEFAULT_DATA_SIZE } from '@/shared/utils/qr-protocol';
import { DENSITY_OPTIONS } from '@/features/send/models/send-density';
import { DEFAULT_QR_COUNT, QR_COUNT_OPTIONS } from '@/features/send/models/send-qr-count';
import { FRAMES_PER_SECOND, SPEED_OPTIONS } from '@/features/send/models/send-speed';

/** Clave con la que se guarda la velocidad elegida (QR por segundo). */
export const SPEED_KEY = 'send.speed';
/** Clave con la que se guarda la densidad elegida (bytes de archivo por QR). */
export const DENSITY_KEY = 'send.density';
/** Clave con la que se guarda cuántos QR se muestran a la vez. */
export const QR_COUNT_KEY = 'send.qrCount';

/**
 * Recuerda en el almacenamiento local del navegador la velocidad, la densidad y cuántos QR se muestran a la vez que el usuario eligió
 * en el emisor, para recuperarlas al volver a cargar la página. Es una preferencia de la aplicación:
 * no incluye datos de ningún archivo y no sale del dispositivo.
 *
 * Un valor guardado que no sea una de las opciones vigentes (alterado, o de una versión anterior) se
 * ignora, y un almacenamiento no disponible (modo privado, cuota) nunca interrumpe el envío.
 *
 * @since 1.0.0
 */
@Service()
export class SendPreferences {
  /** Velocidad guardada (QR por segundo), o la de por defecto si no hay una válida. */
  public speed(): number {
    return this.read(SPEED_KEY, SPEED_OPTIONS, FRAMES_PER_SECOND);
  }

  /** Densidad guardada (bytes por QR), o la de por defecto si no hay una válida. */
  public density(): number {
    return this.read(DENSITY_KEY, DENSITY_OPTIONS, DEFAULT_DATA_SIZE);
  }

  /** QR mostrados a la vez guardados (1 o 2), o el de por defecto si no hay un valor válido. */
  public qrCount(): number {
    return this.read(QR_COUNT_KEY, QR_COUNT_OPTIONS, DEFAULT_QR_COUNT);
  }

  /** Guarda cuántos QR se muestran a la vez. */
  public saveQrCount(count: number): void {
    this.write(QR_COUNT_KEY, count);
  }

  /** Guarda la velocidad elegida. */
  public saveSpeed(framesPerSecond: number): void {
    this.write(SPEED_KEY, framesPerSecond);
  }

  /** Guarda la densidad elegida. */
  public saveDensity(dataSize: number): void {
    this.write(DENSITY_KEY, dataSize);
  }

  private read(key: string, options: readonly number[], fallback: number): number {
    try {
      const stored = Number(globalThis.localStorage?.getItem(key));
      return options.includes(stored) ? stored : fallback;
    } catch {
      return fallback;
    }
  }

  private write(key: string, value: number): void {
    try {
      globalThis.localStorage?.setItem(key, String(value));
    } catch {
      // Sin almacenamiento disponible la elección rige esta sesión, pero no se recuerda.
    }
  }
}
