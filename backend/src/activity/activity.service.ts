import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import {
  ActivityEntityType,
  ActivityLogAction,
} from 'src/generated/prisma/enums';
import { PrismaService } from 'src/prisma.service';

type LogActivityInput = {
  action: ActivityLogAction;
  entityType: ActivityEntityType;
  entityId: string;
  actorId?: string | null;
  ticketId?: string | null;
  userId?: string | null;
  metadata?: Prisma.InputJsonValue | null;
};

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);

  constructor(private readonly prisma: PrismaService) {}

  async logActivity(input: LogActivityInput): Promise<void> {
    try {
      await this.prisma.activityLog.create({
        data: {
          action: input.action,
          entityType: input.entityType,
          entityId: input.entityId,
          actorId: input.actorId ?? null,
          ticketId: input.ticketId ?? null,
          userId: input.userId ?? null,
          metadata: input.metadata ?? Prisma.JsonNull,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to record activity log: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async getRecentActivities(limit = 20) {
    const take = Math.min(Math.max(limit, 1), 200);

    return this.prisma.activityLog.findMany({
      take,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        ticket: {
          select: {
            id: true,
            ticketNumber: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }
}
