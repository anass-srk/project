export enum NotificationType {
  TICKET_PURCHASE = 'TICKET_PURCHASE',
  TRIP_CANCELLATION = 'TRIP_CANCELLATION',
}

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}

export interface NotificationPreference {
  id?: number;
  userId: string;
  channel: NotificationChannel;
  enabledNotificationTypes: NotificationType[];
}

export interface Notification {
  id: number;
  userId: string;
  type: NotificationType;
  content: string;
  sendingDate: string;
  seenDate?: string;
}