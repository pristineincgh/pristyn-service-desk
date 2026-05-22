import { Prisma } from 'src/generated/prisma/client';
import { NotificationType } from 'src/generated/prisma/enums';

export const NOTIFICATION_SELECT = {
  id: true,
  userId: true,
  type: true,
  title: true,
  message: true,
  link: true,
  metadata: true,
  readAt: true,
  createdAt: true,
} satisfies Prisma.NotificationSelect;

export type NotificationListItem = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  metadata: Prisma.JsonValue;
  readAt: Date | null;
  createdAt: Date;
};

export type NotificationModel = NotificationListItem;

export type NotificationDelegate = {
  create(args: Prisma.NotificationCreateArgs): Promise<NotificationListItem>;
  count(args?: Prisma.NotificationCountArgs): Promise<number>;
  findMany(
    args: Prisma.NotificationFindManyArgs,
  ): Promise<NotificationListItem[]>;
  findUnique(
    args: Prisma.NotificationFindUniqueArgs,
  ): Promise<NotificationModel | null>;
  update(args: Prisma.NotificationUpdateArgs): Promise<NotificationModel>;
  updateMany(
    args: Prisma.NotificationUpdateManyArgs,
  ): Promise<Prisma.BatchPayload>;
};
