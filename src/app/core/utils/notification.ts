/**
 * Puente de notificaciones por eventos (ADR-009).
 * Publica feedback de usuario sin acoplar el resto de Core a la librería visual.
 */

export type NotifyLevel = 'success' | 'error' | 'info' | 'warning';
export type NotifyPresentation = 'modal' | 'notification';

export interface NotificationOptions {
  readonly level?: NotifyLevel;
  readonly type?: NotifyPresentation;
}

/** @deprecated Usar `NotificationOptions`. */
export type NotifyOptions = NotificationOptions;

export interface NotificationEvent {
  readonly message: string;
  readonly options?: NotificationOptions;
}

/** Acción de confirmación alineada con MessageAction de la UI, sin importar `@factor_ec/ui`. */
export interface ConfirmAction {
  readonly type: 'outlined' | 'filled' | 'raised' | 'flat' | 'stroked';
  readonly label: string;
  readonly value: string | number;
  readonly metadata?: {
    readonly color?: string;
  };
}

export interface ConfirmOptions {
  readonly class?: string;
  readonly icon?: string;
  readonly actions?: ConfirmAction[];
}

export interface ConfirmEvent {
  readonly message: string;
  readonly options?: ConfirmOptions;
  readonly resolve: (value: unknown) => void;
}

/** EventTarget compartido para los canales `notify` y `confirm`. */
export const notificationEvents = new EventTarget();

/**
 * Publica un mensaje de feedback al usuario vía `CustomEvent('notify')`.
 * El texto debe estar ya localizado cuando sea visible al usuario.
 *
 * @example
 * notify($localize`Changes saved`);
 * notify($localize`Request failed`, { level: 'error' });
 */
export function notify(message: string, options?: NotificationOptions): void {
  const detail: NotificationEvent = { message, options };
  notificationEvents.dispatchEvent(
    new CustomEvent<NotificationEvent>('notify', {
      detail,
    })
  );
}

/**
 * Solicita confirmación al usuario vía `CustomEvent('confirm')`.
 * Resuelve cuando `AppManager` completa el diálogo modal.
 */
export function confirm(message: string, options?: ConfirmOptions): Promise<unknown> {
  return new Promise((resolve) => {
    const detail: ConfirmEvent = { message, options, resolve };
    notificationEvents.dispatchEvent(
      new CustomEvent<ConfirmEvent>('confirm', {
        detail,
      })
    );
  });
}
