/**
 * Helper para leer el detalle de los eventos `notify` emitidos por
 * `notificationEvents` (ver ADR-009 / core/utils/notification.ts).
 */
import type { NotificationEvent } from '@/core/utils/notification';

export function getNotificationDetail(event: Event): NotificationEvent {
  return (event as CustomEvent<NotificationEvent>).detail;
}
