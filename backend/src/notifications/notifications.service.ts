import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { NotificationType, UserRole } from 'src/generated/prisma/enums';
import { PrismaService } from 'src/prisma.service';
import { NotificationsGateway } from './notifications.gateway';
import {
  NOTIFICATION_SELECT,
  NotificationDelegate,
} from './notifications.types';

type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
  metadata?: Prisma.InputJsonValue | null;
};

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  private get notifications(): NotificationDelegate {
    return this.prisma.notification as unknown as NotificationDelegate;
  }

  private getDashboardBasePath(role: UserRole) {
    switch (role) {
      case UserRole.MODERATOR:
        return '/dashboard/moderator';
      case UserRole.SUPERVISOR:
        return '/dashboard/supervisor';
      case UserRole.AGENT:
        return '/dashboard/agent';
      default:
        return '/dashboard';
    }
  }

  buildTicketLink(role: UserRole, ticketId: string) {
    return `${this.getDashboardBasePath(role)}/tickets/${encodeURIComponent(ticketId)}`;
  }

  buildProfileSettingsLink(role: UserRole) {
    return `${this.getDashboardBasePath(role)}/profile-settings`;
  }

  async createNotification(input: CreateNotificationInput) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        link: input.link ?? null,
        metadata: input.metadata ?? Prisma.JsonNull,
      },
      select: NOTIFICATION_SELECT,
    });

    const unreadCount = await this.notifications.count({
      where: {
        userId: input.userId,
        readAt: null,
      },
    });

    this.notificationsGateway.emitNotificationCreated(
      input.userId,
      notification,
    );
    this.notificationsGateway.emitUnreadCountUpdated(input.userId, unreadCount);

    return notification;
  }

  async createNotifications(inputs: CreateNotificationInput[]) {
    return Promise.all(inputs.map((input) => this.createNotification(input)));
  }

  async getNotifications(userId: string, page = 1, limit = 20) {
    const take = Math.min(Math.max(limit, 1), 100);
    const currentPage = Math.max(page, 1);
    const skip = (currentPage - 1) * take;

    const { total, unreadCount, notifications } =
      await this.prisma.$transaction(async (tx) => {
        const [totalCount, unreadTotal, notificationItems] = await Promise.all([
          tx.notification.count({
            where: { userId },
          }),
          tx.notification.count({
            where: {
              userId,
              readAt: null,
            },
          }),
          tx.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            skip,
            take,
            select: NOTIFICATION_SELECT,
          }),
        ]);

        return {
          total: totalCount,
          unreadCount: unreadTotal,
          notifications: notificationItems,
        };
      });

    return {
      total,
      unreadCount,
      page: currentPage,
      limit: take,
      totalPages: Math.max(Math.ceil(total / take), 1),
      hasNextPage: currentPage * take < total,
      hasPrevPage: currentPage > 1,
      notifications,
    };
  }

  async getUnreadCount(userId: string) {
    const unreadCount = await this.notifications.count({
      where: {
        userId,
        readAt: null,
      },
    });

    return { unreadCount };
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.notifications.findUnique({
      where: { id: notificationId },
      select: {
        id: true,
        userId: true,
        readAt: true,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification does not exist');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException(
        'You are not allowed to modify this notification',
      );
    }

    if (!notification.readAt) {
      await this.notifications.update({
        where: { id: notification.id },
        data: {
          readAt: new Date(),
        },
      });
    }

    const unreadCount = await this.notifications.count({
      where: {
        userId,
        readAt: null,
      },
    });
    this.notificationsGateway.emitUnreadCountUpdated(userId, unreadCount);

    return { notificationId: notification.id, unreadCount };
  }

  async markAllAsRead(userId: string) {
    await this.notifications.updateMany({
      where: {
        userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    this.notificationsGateway.emitUnreadCountUpdated(userId, 0);

    return { unreadCount: 0 };
  }
}
