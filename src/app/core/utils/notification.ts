export const notificationEvents = new EventTarget();
export type NotificationEvent = {
  message: string;
  options?: NotificationOptions;
};
export type NotificationOptions = {
  level?: 'success' | 'error' | 'info' | 'warning';
  type?: 'modal' | 'notification';
};
export function notify(message: string, options?: NotificationOptions) {
  notificationEvents.dispatchEvent(
    new CustomEvent('notify', {
      detail: { message, options }
    })
  );
}
