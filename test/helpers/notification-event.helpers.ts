import type { ConfirmEvent, NotificationEvent } from '@/core/utils/notification';

type EventWithDetail<T> = Event & { detail: T };

export function getNotificationDetail(event: Event): NotificationEvent {
  return (event as EventWithDetail<NotificationEvent>).detail;
}

export function getConfirmDetail(event: Event): ConfirmEvent {
  return (event as EventWithDetail<ConfirmEvent>).detail;
}
