export const notificationEvents = new EventTarget();

export type NotificationOptions = {
  level?: 'success' | 'error' | 'info' | 'warning';
  type?: 'modal' | 'notification';
};

export type NotificationEvent = {
  message: string;
  options?: NotificationOptions;
};

export type ConfirmActionType = 'raised' | 'flat' | 'stroked' | 'outlined' | 'filled';

export type ConfirmAction = {
  label: string;
  value: string;
  type: ConfirmActionType;
  metadata?: Record<string, unknown>;
};

export type ConfirmOptions = {
  class?: string;
  icon?: string | { name: string; class?: string; collection?: string };
  actions?: ConfirmAction[];
};

export type ConfirmEvent = {
  message: string;
  options?: ConfirmOptions;
  resolve: (value: string | number | undefined) => void;
};

export function notify(message: string, options?: NotificationOptions): void {
  notificationEvents.dispatchEvent(
    new CustomEvent('notify', {
      detail: { message, options }
    })
  );
}

/** FL-01: a failed `chat.resume` after an interrupt is resolved must not fail silently. */
export function notifyAgentResumeFailure(): void {
  notify($localize`Could not send your response to the assistant. Please try again.`, {
    level: 'error'
  });
}

export function confirm(
  message: string,
  options?: ConfirmOptions
): Promise<string | number | undefined> {
  return new Promise((resolve) => {
    notificationEvents.dispatchEvent(
      new CustomEvent('confirm', {
        detail: { message, options, resolve }
      })
    );
  });
}
