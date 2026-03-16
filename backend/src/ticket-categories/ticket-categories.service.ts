import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTicketCategoryDto } from './dto/create-ticket-category.dto';
import { UpdateTicketCategoryDto } from './dto/update-ticket-category.dto';
import { ActivityService } from 'src/activity/activity.service';
import {
  ActivityEntityType,
  ActivityLogAction,
} from 'src/generated/prisma/enums';
import { PrismaService } from 'src/prisma.service';

const TICKET_CATEGORY_LIST_SELECT = {
  id: true,
  name: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      tickets: true,
    },
  },
} as const;

const TICKET_CATEGORY_DETAIL_SELECT = {
  ...TICKET_CATEGORY_LIST_SELECT,
  tickets: {
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      ticketNumber: true,
      title: true,
      status: true,
      priority: true,
      createdAt: true,
      updatedAt: true,
      customer: {
        select: {
          id: true,
          name: true,
        },
      },
      assignedTo: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
} as const;

@Injectable()
export class TicketCategoriesService {
  constructor(
    private prisma: PrismaService,
    private readonly activityService: ActivityService,
  ) {}

  private normalizeName(name: string) {
    return name.trim();
  }

  private normalizeCategory(category: {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    _count?: {
      tickets: number;
    };
  }) {
    return {
      id: category.id,
      name: category.name,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      ticketCount: category._count?.tickets ?? 0,
    };
  }

  async create(
    createTicketCategoryDto: CreateTicketCategoryDto,
    actorId: string,
  ) {
    const name = this.normalizeName(createTicketCategoryDto.name);

    try {
      const category = await this.prisma.ticketCategory.create({
        data: { name },
        select: TICKET_CATEGORY_LIST_SELECT,
      });

      const normalizedCategory = this.normalizeCategory(category);

      await this.activityService.logActivity({
        action: ActivityLogAction.TICKET_CATEGORY_CREATED,
        entityType: ActivityEntityType.TICKET_CATEGORY,
        entityId: normalizedCategory.id,
        actorId,
        metadata: {
          name: normalizedCategory.name,
        },
      });

      return normalizedCategory;
    } catch {
      throw new BadRequestException('Category already exists');
    }
  }

  async findAll() {
    const categories = await this.prisma.ticketCategory.findMany({
      select: TICKET_CATEGORY_LIST_SELECT,
      orderBy: {
        name: 'asc',
      },
    });

    return categories.map((category) => this.normalizeCategory(category));
  }

  async findOne(id: string) {
    const category = await this.prisma.ticketCategory.findUnique({
      where: { id },
      select: TICKET_CATEGORY_DETAIL_SELECT,
    });

    if (!category) {
      return null;
    }

    return {
      ...this.normalizeCategory(category),
      tickets: category.tickets,
    };
  }

  async update(
    id: string,
    updateTicketCategoryDto: UpdateTicketCategoryDto,
    actorId: string,
  ) {
    const ticketCategory = await this.findOne(id);

    if (!ticketCategory) {
      throw new BadRequestException('Category not found');
    }

    try {
      const updatedCategory = await this.prisma.ticketCategory.update({
        where: { id },
        data: {
          ...(updateTicketCategoryDto.name !== undefined
            ? { name: this.normalizeName(updateTicketCategoryDto.name) }
            : {}),
        },
        select: TICKET_CATEGORY_LIST_SELECT,
      });

      const normalizedCategory = this.normalizeCategory(updatedCategory);

      if (
        updateTicketCategoryDto.name !== undefined &&
        normalizedCategory.name !== ticketCategory.name
      ) {
        await this.activityService.logActivity({
          action: ActivityLogAction.TICKET_CATEGORY_UPDATED,
          entityType: ActivityEntityType.TICKET_CATEGORY,
          entityId: normalizedCategory.id,
          actorId,
          metadata: {
            changedFields: ['name'],
            previousName: ticketCategory.name,
            name: normalizedCategory.name,
            previous: {
              name: ticketCategory.name,
            },
            current: {
              name: normalizedCategory.name,
            },
          },
        });
      }

      return normalizedCategory;
    } catch {
      throw new BadRequestException('Category already exists');
    }
  }

  async remove(id: string, actorId: string) {
    const ticketCategory = await this.findOne(id);

    if (!ticketCategory) {
      throw new BadRequestException('Category not found');
    }

    const count = await this.prisma.ticket.count({
      where: { ticketCategoryId: id },
    });

    if (count > 0) {
      throw new BadRequestException(
        'Cannot delete category because it is assigned to existing tickets',
      );
    }

    await this.activityService.logActivity({
      action: ActivityLogAction.TICKET_CATEGORY_DELETED,
      entityType: ActivityEntityType.TICKET_CATEGORY,
      entityId: ticketCategory.id,
      actorId,
      metadata: {
        name: ticketCategory.name,
      },
    });

    await this.prisma.ticketCategory.delete({
      where: { id },
    });
  }
}
