import { useQuery } from '@tanstack/react-query';
import * as endpoints from './endpoints';
import type {
  NotificationListResponse,
  NotificationUnreadCountResponse,
} from '@/types/notification-types';

export const notificationQueryKeys = {
  all: ['notifications'] as const,
  list: (page: number, limit: number) =>
    ['notifications', 'list', page, limit] as const,
  unreadCount: ['notifications', 'unread-count'] as const,
};

export const useNotifications = (page = 1, limit = 20, enabled = true) =>
  useQuery<NotificationListResponse>({
    queryKey: notificationQueryKeys.list(page, limit),
    queryFn: () => endpoints.getNotifications(page, limit),
    enabled,
  });

export const useUnreadNotificationCount = (enabled = true) =>
  useQuery<NotificationUnreadCountResponse>({
    queryKey: notificationQueryKeys.unreadCount,
    queryFn: endpoints.getUnreadNotificationCount,
    enabled,
  });
