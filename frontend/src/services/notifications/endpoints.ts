import { apiFetch } from '@/lib/api';
import type {
  MarkAllNotificationsReadResponse,
  MarkNotificationReadResponse,
  NotificationListResponse,
  NotificationUnreadCountResponse,
} from '@/types/notification-types';

const BASE_URL = '/api/notifications';

export const getNotifications = async (
  page = 1,
  limit = 20,
): Promise<NotificationListResponse> => {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  return apiFetch(`${BASE_URL}?${query.toString()}`);
};

export const getUnreadNotificationCount =
  async (): Promise<NotificationUnreadCountResponse> =>
    apiFetch(`${BASE_URL}/unread-count`);

export const markNotificationRead = async (
  id: string,
): Promise<MarkNotificationReadResponse> =>
  apiFetch(`${BASE_URL}/${encodeURIComponent(id)}/read`, {
    method: 'PATCH',
  });

export const markAllNotificationsRead =
  async (): Promise<MarkAllNotificationsReadResponse> =>
    apiFetch(`${BASE_URL}/read-all`, {
      method: 'PATCH',
    });
