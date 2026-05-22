export type NotificationType =
  | 'TICKET_ASSIGNED'
  | 'TICKET_REASSIGNED'
  | 'TICKET_STATUS_CHANGED'
  | 'TICKET_NOTE_ADDED'
  | 'SUPERVISOR_ASSIGNED'
  | 'USER_PASSWORD_RESET';

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  metadata: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationListResponse {
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  notifications: NotificationItem[];
}

export interface NotificationUnreadCountResponse {
  unreadCount: number;
}

export interface MarkNotificationReadResponse {
  notificationId: string;
  unreadCount: number;
}

export interface MarkAllNotificationsReadResponse {
  unreadCount: number;
}
