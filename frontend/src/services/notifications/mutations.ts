import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as endpoints from './endpoints';
import { notificationQueryKeys } from './queries';

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => endpoints.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to mark notification as read');
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: endpoints.markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to mark notifications as read');
    },
  });
};
