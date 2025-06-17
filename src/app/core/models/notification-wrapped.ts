import { Notification } from './notification';

export interface NotificationWrapped {
  readTimer: ReturnType<typeof setTimeout> | null;
  notification: Notification;
}
