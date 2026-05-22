'use client';

import { useRouter } from 'next/navigation';
import { formatDistanceToNowStrict, isValid, parseISO } from 'date-fns';
import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useNotifications,
  useUnreadNotificationCount,
} from '@/services/notifications/queries';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from '@/services/notifications/mutations';
import { useAuthStore } from '@/store/auth-store';
import { cn } from '@/lib/utils';

const formatRelativeTime = (value: string) => {
  const parsed = parseISO(value);

  if (!isValid(parsed)) {
    return 'Just now';
  }

  return formatDistanceToNowStrict(parsed, { addSuffix: true });
};

const NotificationBell = () => {
  const router = useRouter();
  const authUser = useAuthStore((state) => state.authUser);
  const { data: notificationsResponse } = useNotifications(
    1,
    8,
    Boolean(authUser),
  );
  const { data: unreadResponse } = useUnreadNotificationCount(Boolean(authUser));
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const notifications = notificationsResponse?.notifications ?? [];
  const unreadCount =
    unreadResponse?.unreadCount ?? notificationsResponse?.unreadCount ?? 0;

  const handleNotificationClick = async (notificationId: string, link?: string | null) => {
    try {
      await markReadMutation.mutateAsync(notificationId);
    } catch {
      return;
    }

    if (link) {
      router.push(link);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='relative h-9 w-9'>
          <Bell className='h-5 w-5' />
          {unreadCount > 0 ? (
            <span className='absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground'>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='end' className='w-96'>
        <div className='flex items-center justify-between px-2 py-1'>
          <DropdownMenuLabel className='px-0 py-0 text-sm text-foreground'>
            Notifications
          </DropdownMenuLabel>
          <Button
            size='sm'
            variant='ghost'
            className='h-7 px-2 text-xs'
            onClick={() => markAllReadMutation.mutate()}
            disabled={unreadCount === 0 || markAllReadMutation.isPending}
          >
            <CheckCheck />
            Mark all read
          </Button>
        </div>

        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className='px-3 py-6 text-center text-sm text-muted-foreground'>
            No notifications yet.
          </div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className='block cursor-pointer rounded-md p-0 focus:bg-transparent'
              onSelect={(event) => {
                event.preventDefault();
              }}
            >
              <button
                type='button'
                className={cn(
                  'w-full rounded-md px-3 py-3 text-left transition-colors hover:bg-accent',
                  !notification.readAt && 'bg-primary/5',
                )}
                onClick={() =>
                  void handleNotificationClick(
                    notification.id,
                    notification.link,
                  )
                }
              >
                <div className='flex items-start justify-between gap-3'>
                  <div className='min-w-0'>
                    <p className='truncate text-sm font-medium text-foreground'>
                      {notification.title}
                    </p>
                    <p className='mt-1 line-clamp-2 text-xs text-muted-foreground'>
                      {notification.message}
                    </p>
                  </div>
                  {!notification.readAt ? (
                    <span className='mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary' />
                  ) : null}
                </div>
                <p className='mt-2 text-[11px] text-muted-foreground'>
                  {formatRelativeTime(notification.createdAt)}
                </p>
              </button>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
