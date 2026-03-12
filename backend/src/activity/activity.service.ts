import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import {
  ActivityEntityType,
  ActivityLogAction,
} from 'src/generated/prisma/enums';
import { PrismaService } from 'src/prisma.service';
import { FindActivitiesQueryDto } from './dto/find-activities-query.dto';

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

  private readonly activityInclude = {
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
  } satisfies Prisma.ActivityLogInclude;

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
      include: this.activityInclude,
    });
  }

  async getActivities(query: FindActivitiesQueryDto) {
    const page = Math.max(query.page ?? 1, 1);
    const limit = Math.min(Math.max(query.limit ?? 20, 1), 100);
    const search = query.search?.trim();
    const dateFrom = query.dateFrom ? new Date(query.dateFrom) : undefined;
    const dateTo = query.dateTo ? new Date(query.dateTo) : undefined;

    const filters: Prisma.ActivityLogWhereInput[] = [];

    if (query.entityType) {
      filters.push({
        entityType: query.entityType,
      });
    }

    if (query.action) {
      filters.push({
        action: query.action,
      });
    }

    if (query.actorId) {
      filters.push({
        actorId: query.actorId,
      });
    }

    if (search) {
      filters.push({
        OR: [
          {
            entityId: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            actor: {
              name: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          },
          {
            ticket: {
              ticketNumber: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          },
          {
            ticket: {
              title: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          },
          {
            user: {
              name: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          },
          {
            user: {
              email: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          },
        ],
      });
    }

    if (dateFrom || dateTo) {
      const createdAtFilter: Prisma.DateTimeFilter = {};

      if (dateFrom) {
        createdAtFilter.gte = dateFrom;
      }

      if (dateTo) {
        const inclusiveEnd = new Date(dateTo);
        inclusiveEnd.setHours(23, 59, 59, 999);
        createdAtFilter.lte = inclusiveEnd;
      }

      filters.push({
        createdAt: createdAtFilter,
      });
    }

    const where: Prisma.ActivityLogWhereInput =
      filters.length > 0 ? { AND: filters } : {};
    const skip = (page - 1) * limit;

    const [total, activities] = await this.prisma.$transaction([
      this.prisma.activityLog.count({ where }),
      this.prisma.activityLog.findMany({
        where,
        include: this.activityInclude,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.max(Math.ceil(total / limit), 1),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
      activities,
    };
  }
}
