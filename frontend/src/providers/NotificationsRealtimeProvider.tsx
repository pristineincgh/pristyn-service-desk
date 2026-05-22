'use client';

import { useEffect, useMemo, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth-store';
import { notificationQueryKeys } from '@/services/notifications/queries';

type NotificationSocketPayload = {
  id: string;
  title: string;
  message: string;
};

const getSocketUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    return null;
  }

  try {
    return new URL(apiUrl).origin;
  } catch {
    return null;
  }
};

const NotificationsRealtimeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const authUser = useAuthStore((state) => state.authUser);
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const socketUrl = useMemo(() => getSocketUrl(), []);

  useEffect(() => {
    if (!authUser || !socketUrl) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    const socket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
    });

    socket.on('notification.created', (payload: NotificationSocketPayload) => {
      toast.info(payload.title, {
        description: payload.message,
      });
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
    });

    socket.on(
      'notification.unread-count',
      (payload: { unreadCount: number }) => {
        queryClient.setQueryData(notificationQueryKeys.unreadCount, payload);
      },
    );

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [authUser, queryClient, socketUrl]);

  return <>{children}</>;
};

export default NotificationsRealtimeProvider;
