import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomInt } from 'crypto';
import { Prisma } from 'src/generated/prisma/client';
import {
  ActivityEntityType,
  ActivityLogAction,
  Priority,
  TicketStatus,
  UserRole,
} from 'src/generated/prisma/enums';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { FindAllTicketsQueryDto } from './dto/find-all-tickets-query.dto';
import { BulkReassignTicketsDto } from './dto/bulk-reassign-tickets.dto';
import { BulkUpdateTicketStatusDto } from './dto/bulk-update-ticket-status.dto';
import { BulkDeleteTicketsDto } from './dto/bulk-delete-tickets.dto';
import { CreateTicketNoteDto } from './dto/create-ticket-note.dto';
import { UpdateTicketNoteDto } from './dto/update-ticket-note.dto';
import { UsersService } from 'src/users/users.service';
import { ActivityService } from 'src/activity/activity.service';
import { PrismaService } from 'src/prisma.service';

const TICKET_INCLUDE = {
  assignedTo: {
    select: {
      id: true,
      name: true,
    },
  },
  createdBy: {
    select: {
      id: true,
      name: true,
    },
  },
  updatedBy: {
    select: {
      id: true,
      name: true,
    },
  },
  ticketCategory: {
    select: {
      id: true,
      name: true,
    },
  },
  customer: {
    select: {
      id: true,
      name: true,
    },
  },
} as const;

const TICKET_NOTE_INCLUDE = {
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
  createdByCustomer: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  },
} as const;

const TICKET_DETAILS_INCLUDE = {
  ...TICKET_INCLUDE,
  notes: {
    include: TICKET_NOTE_INCLUDE,
    orderBy: {
      createdAt: 'asc',
    },
  },
} as const;

type TicketWithRelations = Prisma.TicketGetPayload<{
  include: typeof TICKET_INCLUDE;
}>;

type TicketSlaState = 'ON_TRACK' | 'AT_RISK' | 'BREACHED' | 'COMPLETED';

type TicketSlaSnapshot = {
  targetHours: number;
  atRiskWindowHours: number;
  deadlineAt: string;
  calculatedAt: string;
  remainingMs: number;
  remainingHours: number;
  breached: boolean;
  atRisk: boolean;
  state: TicketSlaState;
};

type TicketWithSla<TTicket extends TicketWithRelations = TicketWithRelations> =
  TTicket & {
    sla: TicketSlaSnapshot;
  };

type TicketAccessRecord = {
  id: string;
  title: string;
  status: TicketStatus;
  priority: Priority;
  assignedToId: string | null;
  createdById: string;
  createdBy: {
    supervisorId: string | null;
  };
};

const ACTIVE_SLA_STATUSES: TicketStatus[] = [
  TicketStatus.OPEN,
  TicketStatus.IN_PROGRESS,
];
const MAX_TICKET_NUMBER_GENERATION_ATTEMPTS = 10;

@Injectable()
export class TicketsService {
  private readonly slaHoursByPriority: Record<Priority, number>;
  private readonly slaAtRiskWindowHours: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly activityService: ActivityService,
  ) {
    this.slaHoursByPriority = {
      [Priority.HIGH]: this.configService.get<number>(
        'sla.highPriorityHours',
        24,
      ),
      [Priority.MEDIUM]: this.configService.get<number>(
        'sla.mediumPriorityHours',
        48,
      ),
      [Priority.LOW]: this.configService.get<number>(
        'sla.lowPriorityHours',
        72,
      ),
    };
    this.slaAtRiskWindowHours = this.configService.get<number>(
      'sla.atRiskWindowHours',
      6,
    );
  }

  private buildTicketSla(ticket: TicketWithRelations): TicketSlaSnapshot {
    const calculatedAtMs = Date.now();
    const targetHours = this.slaHoursByPriority[ticket.priority];
    const deadlineMs =
      ticket.createdAt.getTime() + targetHours * 60 * 60 * 1000;
    const remainingMs = deadlineMs - calculatedAtMs;
    const remainingHours = remainingMs / (60 * 60 * 1000);
    const isActive = ACTIVE_SLA_STATUSES.includes(ticket.status);
    const breached = isActive && remainingMs < 0;
    const atRisk =
      isActive &&
      !breached &&
      remainingMs <= this.slaAtRiskWindowHours * 60 * 60 * 1000;

    const state: TicketSlaState = !isActive
      ? 'COMPLETED'
      : breached
        ? 'BREACHED'
        : atRisk
          ? 'AT_RISK'
          : 'ON_TRACK';

    return {
      targetHours,
      atRiskWindowHours: this.slaAtRiskWindowHours,
      deadlineAt: new Date(deadlineMs).toISOString(),
      calculatedAt: new Date(calculatedAtMs).toISOString(),
      remainingMs,
      remainingHours,
      breached,
      atRisk,
      state,
    };
  }

  private withSla<TTicket extends TicketWithRelations>(
    ticket: TTicket,
  ): TicketWithSla<TTicket> {
    return {
      ...ticket,
      sla: this.buildTicketSla(ticket),
    };
  }

  private async getRequesterOrThrow(userId: string) {
    const requester = await this.usersService.findById(userId);

    if (!requester) {
      throw new NotFoundException('User does not exist');
    }

    return requester;
  }

  private getTicketScopeWhere(requester: { id: string; role: UserRole }) {
    if (requester.role === UserRole.MODERATOR) {
      return {};
    }

    if (requester.role === UserRole.SUPERVISOR) {
      return {
        OR: [
          { createdById: requester.id },
          { createdBy: { supervisorId: requester.id } },
        ],
      };
    }

    if (requester.role === UserRole.AGENT) {
      return {
        OR: [{ createdById: requester.id }, { assignedToId: requester.id }],
      };
    }

    throw new ForbiddenException('Unsupported user role');
  }

  private isAgentTicketAccessible(
    ticket: {
      createdById: string;
      assignedToId: string | null;
    },
    requesterId: string,
  ) {
    return (
      ticket.createdById === requesterId || ticket.assignedToId === requesterId
    );
  }

  private isSupervisorTicketAccessible(
    ticket: {
      createdById: string;
      createdBy: {
        supervisorId: string | null;
      };
    },
    requesterId: string,
  ) {
    const isOwnTicket = ticket.createdById === requesterId;
    const isSubordinateTicket = ticket.createdBy.supervisorId === requesterId;

    return isOwnTicket || isSubordinateTicket;
  }

  private async validateTicketAccess(ticketId: string, requesterId: string) {
    const requester = await this.getRequesterOrThrow(requesterId);

    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      select: {
        id: true,
        assignedToId: true,
        createdById: true,
        createdBy: {
          select: {
            supervisorId: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (requester.role === UserRole.MODERATOR) {
      return requester;
    }

    if (requester.role === UserRole.AGENT) {
      if (!this.isAgentTicketAccessible(ticket, requester.id)) {
        throw new ForbiddenException(
          'Agents can only manage tickets they created or are assigned to',
        );
      }

      return requester;
    }

    if (requester.role === UserRole.SUPERVISOR) {
      if (!this.isSupervisorTicketAccessible(ticket, requester.id)) {
        throw new ForbiddenException(
          'Supervisors can only manage their own tickets and subordinate tickets',
        );
      }

      return requester;
    }

    throw new ForbiddenException('Unsupported user role');
  }

  private async getAccessibleTicketsOrThrow(
    ticketIds: string[],
    requesterId: string,
  ) {
    const requester = await this.getRequesterOrThrow(requesterId);
    const uniqueTicketIds = [...new Set(ticketIds)];

    if (uniqueTicketIds.length === 0) {
      throw new BadRequestException('At least one ticket id is required');
    }

    const tickets = await this.prisma.ticket.findMany({
      where: {
        id: {
          in: uniqueTicketIds,
        },
      },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        assignedToId: true,
        createdById: true,
        createdBy: {
          select: {
            supervisorId: true,
          },
        },
      },
    });

    if (tickets.length !== uniqueTicketIds.length) {
      const foundTicketIds = new Set(tickets.map((ticket) => ticket.id));
      const missingTicketIds = uniqueTicketIds.filter(
        (ticketId) => !foundTicketIds.has(ticketId),
      );

      throw new NotFoundException(
        `Tickets not found: ${missingTicketIds.join(', ')}`,
      );
    }

    if (requester.role === UserRole.MODERATOR) {
      return {
        requester,
        ticketIds: uniqueTicketIds,
        tickets: tickets as TicketAccessRecord[],
      };
    }

    if (requester.role === UserRole.AGENT) {
      const hasUnauthorizedTicket = tickets.some(
        (ticket) => !this.isAgentTicketAccessible(ticket, requester.id),
      );

      if (hasUnauthorizedTicket) {
        throw new ForbiddenException(
          'Agents can only manage tickets they created or are assigned to',
        );
      }

      return {
        requester,
        ticketIds: uniqueTicketIds,
        tickets: tickets as TicketAccessRecord[],
      };
    }

    if (requester.role === UserRole.SUPERVISOR) {
      const hasUnauthorizedTicket = tickets.some(
        (ticket) => !this.isSupervisorTicketAccessible(ticket, requester.id),
      );

      if (hasUnauthorizedTicket) {
        throw new ForbiddenException(
          'Supervisors can only manage their own tickets and subordinate tickets',
        );
      }

      return {
        requester,
        ticketIds: uniqueTicketIds,
        tickets: tickets as TicketAccessRecord[],
      };
    }

    throw new ForbiddenException('Unsupported user role');
  }

  private generateTicketNumber() {
    const randomNumericPart = randomInt(0, 10_000_000)
      .toString()
      .padStart(7, '0');

    return `INC${randomNumericPart}`;
  }

  private isTicketNumberUniqueConstraintError(error: unknown) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
      return false;
    }

    if (error.code !== 'P2002') {
      return false;
    }

    const target = error.meta?.target;
    if (Array.isArray(target)) {
      return target.includes('ticketNumber');
    }

    if (typeof target === 'string') {
      return target.includes('ticketNumber');
    }

    return false;
  }

  async createTicket(createTicketDto: CreateTicketDto, currentUserId: string) {
    await this.getRequesterOrThrow(currentUserId);

    const assignedToId = createTicketDto.assignedToId ?? currentUserId;

    // check if assigned user exists
    if (assignedToId !== currentUserId) {
      const assignedUser = await this.usersService.findById(assignedToId);

      if (!assignedUser) {
        throw new NotFoundException('Assigned user does not exist');
      }
    }

    // validate category
    const category = await this.prisma.ticketCategory.findUnique({
      where: { id: createTicketDto.categoryId },
    });
    if (!category) throw new NotFoundException('Category not found');

    // validate customer
    const customer = await this.prisma.customer.findUnique({
      where: { id: createTicketDto.customerId },
      select: { id: true },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    let ticket: TicketWithRelations | null = null;

    for (
      let attempt = 1;
      attempt <= MAX_TICKET_NUMBER_GENERATION_ATTEMPTS;
      attempt++
    ) {
      const ticketNumber = this.generateTicketNumber();

      try {
        ticket = await this.prisma.ticket.create({
          data: {
            ticketNumber,
            title: createTicketDto.title,
            description: createTicketDto.description,
            ticketCategoryId: createTicketDto.categoryId,
            customerId: createTicketDto.customerId,
            status: createTicketDto.status, // defaults handled by Prisma
            priority: createTicketDto.priority,
            assignedToId,
            createdById: currentUserId,
            updatedById: currentUserId,
          },
          include: TICKET_INCLUDE,
        });

        break;
      } catch (error) {
        const shouldRetry =
          this.isTicketNumberUniqueConstraintError(error) &&
          attempt < MAX_TICKET_NUMBER_GENERATION_ATTEMPTS;

        if (shouldRetry) {
          continue;
        }

        throw error;
      }
    }

    if (!ticket) {
      throw new InternalServerErrorException(
        'Unable to generate unique ticket number',
      );
    }

    await this.activityService.logActivity({
      action: ActivityLogAction.TICKET_CREATED,
      entityType: ActivityEntityType.TICKET,
      entityId: ticket.id,
      actorId: currentUserId,
      ticketId: ticket.id,
      userId: ticket.createdById,
      metadata: {
        title: ticket.title,
        status: ticket.status,
        priority: ticket.priority,
      },
    });

    if (ticket.assignedToId) {
      await this.activityService.logActivity({
        action: ActivityLogAction.TICKET_ASSIGNED,
        entityType: ActivityEntityType.TICKET,
        entityId: ticket.id,
        actorId: currentUserId,
        ticketId: ticket.id,
        userId: ticket.assignedToId,
        metadata: {
          previousAssignedToId: null,
          assignedToId: ticket.assignedToId,
          reason: 'initial_assignment',
        },
      });
    }

    return this.withSla(ticket);
  }

  async findAllTickets(currentUserId: string, query: FindAllTicketsQueryDto) {
    const requester = await this.getRequesterOrThrow(currentUserId);
    const scopeWhere = this.getTicketScopeWhere({
      id: requester.id,
      role: requester.role,
    });
    const filters: Prisma.TicketWhereInput[] = [scopeWhere];

    if (query.categoryId) {
      filters.push({
        ticketCategoryId: query.categoryId,
      });
    }

    if (query.status) {
      filters.push({
        status: query.status,
      });
    }

    if (query.priority) {
      filters.push({
        priority: query.priority,
      });
    }

    if (query.search) {
      filters.push({
        OR: [
          {
            ticketNumber: {
              contains: query.search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            customer: {
              name: {
                contains: query.search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          },
        ],
      });
    }

    const where: Prisma.TicketWhereInput =
      filters.length === 1 ? filters[0] : { AND: filters };

    const take = Math.min(Math.max(query.limit ?? 20, 1), 100);
    const page = Math.max(query.page ?? 1, 1);
    const skip = (page - 1) * take;

    const [total, tickets] = await this.prisma.$transaction([
      this.prisma.ticket.count({ where }),
      this.prisma.ticket.findMany({
        where,
        include: TICKET_INCLUDE,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
      }),
    ]);

    return {
      total,
      page,
      limit: take,
      totalPages: Math.ceil(total / take),
      hasNextPage: page * take < total,
      hasPrevPage: page > 1,
      tickets: tickets.map((ticket) => this.withSla(ticket)),
    };
  }

  async findTicketById(ticketId: string, currentUserId: string) {
    await this.validateTicketAccess(ticketId, currentUserId);

    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: TICKET_DETAILS_INCLUDE,
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return this.withSla(ticket);
  }

  async updateTicket(
    ticketId: string,
    updateTicketDto: UpdateTicketDto,
    currentUserId: string,
  ) {
    const requester = await this.validateTicketAccess(ticketId, currentUserId);
    const existingTicket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      select: {
        id: true,
        title: true,
        assignedToId: true,
        status: true,
        priority: true,
      },
    });

    if (!existingTicket) {
      throw new NotFoundException('Ticket not found');
    }

    if (updateTicketDto.assignedToId !== undefined) {
      const assignedUser = await this.usersService.findById(
        updateTicketDto.assignedToId,
      );

      if (!assignedUser) {
        throw new NotFoundException('Assigned user does not exist');
      }
    }

    if (updateTicketDto.categoryId !== undefined) {
      const category = await this.prisma.ticketCategory.findUnique({
        where: { id: updateTicketDto.categoryId },
        select: { id: true },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    const data: Prisma.TicketUncheckedUpdateInput = {
      updatedById: requester.id,
      ...(updateTicketDto.title !== undefined
        ? { title: updateTicketDto.title }
        : {}),
      ...(updateTicketDto.description !== undefined
        ? { description: updateTicketDto.description }
        : {}),
      ...(updateTicketDto.status !== undefined
        ? { status: updateTicketDto.status }
        : {}),
      ...(updateTicketDto.priority !== undefined
        ? { priority: updateTicketDto.priority }
        : {}),
      ...(updateTicketDto.categoryId !== undefined
        ? { ticketCategoryId: updateTicketDto.categoryId }
        : {}),
      ...(updateTicketDto.assignedToId !== undefined
        ? { assignedToId: updateTicketDto.assignedToId }
        : {}),
    };

    const ticket = await this.prisma.ticket.update({
      where: { id: ticketId },
      data,
      include: TICKET_INCLUDE,
    });

    const changedFields = Object.entries(updateTicketDto)
      .filter(([, value]) => value !== undefined)
      .map(([key]) => key);

    if (changedFields.length > 0) {
      await this.activityService.logActivity({
        action: ActivityLogAction.TICKET_UPDATED,
        entityType: ActivityEntityType.TICKET,
        entityId: ticket.id,
        actorId: requester.id,
        ticketId: ticket.id,
        metadata: {
          changedFields,
        },
      });
    }

    if (
      updateTicketDto.assignedToId !== undefined &&
      updateTicketDto.assignedToId !== existingTicket.assignedToId
    ) {
      await this.activityService.logActivity({
        action: ActivityLogAction.TICKET_ASSIGNED,
        entityType: ActivityEntityType.TICKET,
        entityId: ticket.id,
        actorId: requester.id,
        ticketId: ticket.id,
        userId: ticket.assignedToId,
        metadata: {
          previousAssignedToId: existingTicket.assignedToId,
          assignedToId: ticket.assignedToId,
        },
      });
    }

    if (
      updateTicketDto.status !== undefined &&
      updateTicketDto.status !== existingTicket.status
    ) {
      await this.activityService.logActivity({
        action: ActivityLogAction.TICKET_STATUS_CHANGED,
        entityType: ActivityEntityType.TICKET,
        entityId: ticket.id,
        actorId: requester.id,
        ticketId: ticket.id,
        metadata: {
          previousStatus: existingTicket.status,
          status: ticket.status,
        },
      });
    }

    if (
      updateTicketDto.priority !== undefined &&
      updateTicketDto.priority !== existingTicket.priority
    ) {
      await this.activityService.logActivity({
        action: ActivityLogAction.TICKET_PRIORITY_CHANGED,
        entityType: ActivityEntityType.TICKET,
        entityId: ticket.id,
        actorId: requester.id,
        ticketId: ticket.id,
        metadata: {
          previousPriority: existingTicket.priority,
          priority: ticket.priority,
        },
      });
    }

    return this.withSla(ticket);
  }

  async bulkReassignTickets(
    dto: BulkReassignTicketsDto,
    currentUserId: string,
  ) {
    const { requester, ticketIds, tickets } =
      await this.getAccessibleTicketsOrThrow(dto.ticketIds, currentUserId);

    const assignedUser = await this.usersService.findById(dto.assignedToId);
    if (!assignedUser) {
      throw new NotFoundException('Assigned user does not exist');
    }

    await this.prisma.ticket.updateMany({
      where: {
        id: {
          in: ticketIds,
        },
      },
      data: {
        assignedToId: dto.assignedToId,
        updatedById: requester.id,
      },
    });

    const changedAssignees = tickets.filter(
      (ticket) => ticket.assignedToId !== dto.assignedToId,
    );

    for (const ticket of changedAssignees) {
      await this.activityService.logActivity({
        action: ActivityLogAction.TICKET_UPDATED,
        entityType: ActivityEntityType.TICKET,
        entityId: ticket.id,
        actorId: requester.id,
        ticketId: ticket.id,
        metadata: {
          changedFields: ['assignedToId'],
        },
      });

      await this.activityService.logActivity({
        action: ActivityLogAction.TICKET_ASSIGNED,
        entityType: ActivityEntityType.TICKET,
        entityId: ticket.id,
        actorId: requester.id,
        ticketId: ticket.id,
        userId: dto.assignedToId,
        metadata: {
          previousAssignedToId: ticket.assignedToId,
          assignedToId: dto.assignedToId,
        },
      });
    }

    return {
      ticketIds,
      updatedCount: ticketIds.length,
      changedCount: changedAssignees.length,
    };
  }

  async bulkUpdateTicketStatus(
    dto: BulkUpdateTicketStatusDto,
    currentUserId: string,
  ) {
    const { requester, ticketIds, tickets } =
      await this.getAccessibleTicketsOrThrow(dto.ticketIds, currentUserId);

    await this.prisma.ticket.updateMany({
      where: {
        id: {
          in: ticketIds,
        },
      },
      data: {
        status: dto.status,
        updatedById: requester.id,
      },
    });

    const changedStatuses = tickets.filter(
      (ticket) => ticket.status !== dto.status,
    );

    for (const ticket of changedStatuses) {
      await this.activityService.logActivity({
        action: ActivityLogAction.TICKET_UPDATED,
        entityType: ActivityEntityType.TICKET,
        entityId: ticket.id,
        actorId: requester.id,
        ticketId: ticket.id,
        metadata: {
          changedFields: ['status'],
        },
      });

      await this.activityService.logActivity({
        action: ActivityLogAction.TICKET_STATUS_CHANGED,
        entityType: ActivityEntityType.TICKET,
        entityId: ticket.id,
        actorId: requester.id,
        ticketId: ticket.id,
        metadata: {
          previousStatus: ticket.status,
          status: dto.status,
        },
      });
    }

    return {
      ticketIds,
      updatedCount: ticketIds.length,
      changedCount: changedStatuses.length,
    };
  }

  async bulkDeleteTickets(dto: BulkDeleteTicketsDto, currentUserId: string) {
    const { requester, ticketIds, tickets } =
      await this.getAccessibleTicketsOrThrow(dto.ticketIds, currentUserId);

    for (const ticket of tickets) {
      await this.activityService.logActivity({
        action: ActivityLogAction.TICKET_DELETED,
        entityType: ActivityEntityType.TICKET,
        entityId: ticket.id,
        actorId: requester.id,
        ticketId: ticket.id,
        metadata: {
          title: ticket.title,
        },
      });
    }

    const deletedTickets = await this.prisma.$transaction(async (tx) => {
      await tx.ticketNote.deleteMany({
        where: {
          ticketId: {
            in: ticketIds,
          },
        },
      });

      return tx.ticket.deleteMany({
        where: {
          id: {
            in: ticketIds,
          },
        },
      });
    });

    return {
      ticketIds,
      deletedCount: deletedTickets.count,
    };
  }

  private canManageTicketNote(
    requester: { id: string; role: UserRole },
    note: {
      createdById: string | null;
    },
  ) {
    if (requester.role === UserRole.MODERATOR) {
      return true;
    }

    return note.createdById === requester.id;
  }

  async findTicketNotes(ticketId: string, currentUserId: string) {
    await this.validateTicketAccess(ticketId, currentUserId);

    return this.prisma.ticketNote.findMany({
      where: { ticketId },
      include: TICKET_NOTE_INCLUDE,
      orderBy: { createdAt: 'asc' },
    });
  }

  async createTicketNote(
    ticketId: string,
    dto: CreateTicketNoteDto,
    currentUserId: string,
  ) {
    const requester = await this.validateTicketAccess(ticketId, currentUserId);

    const note = await this.prisma.ticketNote.create({
      data: {
        ticketId,
        content: dto.content.trim(),
        isInternal: dto.isInternal ?? true,
        createdById: requester.id,
      },
      include: TICKET_NOTE_INCLUDE,
    });

    await this.activityService.logActivity({
      action: ActivityLogAction.TICKET_UPDATED,
      entityType: ActivityEntityType.TICKET,
      entityId: ticketId,
      actorId: requester.id,
      ticketId,
      metadata: {
        changedFields: ['noteAdded'],
        noteId: note.id,
        isInternal: note.isInternal,
      },
    });

    return note;
  }

  async updateTicketNote(
    ticketId: string,
    noteId: string,
    dto: UpdateTicketNoteDto,
    currentUserId: string,
  ) {
    const requester = await this.validateTicketAccess(ticketId, currentUserId);
    const existingNote = await this.prisma.ticketNote.findFirst({
      where: {
        id: noteId,
        ticketId,
      },
      select: {
        id: true,
        content: true,
        isInternal: true,
        createdById: true,
      },
    });

    if (!existingNote) {
      throw new NotFoundException('Ticket note not found');
    }

    if (!this.canManageTicketNote(requester, existingNote)) {
      throw new ForbiddenException('You are not allowed to update this note');
    }

    const data: Prisma.TicketNoteUncheckedUpdateInput = {
      ...(dto.content !== undefined ? { content: dto.content.trim() } : {}),
      ...(dto.isInternal !== undefined ? { isInternal: dto.isInternal } : {}),
    };

    const note = await this.prisma.ticketNote.update({
      where: { id: noteId },
      data,
      include: TICKET_NOTE_INCLUDE,
    });

    const changedFields: string[] = [];
    if (
      dto.content !== undefined &&
      dto.content.trim() !== existingNote.content
    ) {
      changedFields.push('noteContent');
    }
    if (
      dto.isInternal !== undefined &&
      dto.isInternal !== existingNote.isInternal
    ) {
      changedFields.push('noteVisibility');
    }

    if (changedFields.length > 0) {
      await this.activityService.logActivity({
        action: ActivityLogAction.TICKET_UPDATED,
        entityType: ActivityEntityType.TICKET,
        entityId: ticketId,
        actorId: requester.id,
        ticketId,
        metadata: {
          changedFields,
          noteId: note.id,
        },
      });
    }

    return note;
  }

  async deleteTicketNote(
    ticketId: string,
    noteId: string,
    currentUserId: string,
  ) {
    const requester = await this.validateTicketAccess(ticketId, currentUserId);
    const existingNote = await this.prisma.ticketNote.findFirst({
      where: {
        id: noteId,
        ticketId,
      },
      select: {
        id: true,
        createdById: true,
      },
    });

    if (!existingNote) {
      throw new NotFoundException('Ticket note not found');
    }

    if (!this.canManageTicketNote(requester, existingNote)) {
      throw new ForbiddenException('You are not allowed to delete this note');
    }

    await this.prisma.ticketNote.delete({
      where: { id: noteId },
    });

    await this.activityService.logActivity({
      action: ActivityLogAction.TICKET_UPDATED,
      entityType: ActivityEntityType.TICKET,
      entityId: ticketId,
      actorId: requester.id,
      ticketId,
      metadata: {
        changedFields: ['noteDeleted'],
        noteId,
      },
    });
  }

  async deleteTicket(ticketId: string, currentUserId: string) {
    const requester = await this.validateTicketAccess(ticketId, currentUserId);
    const existingTicket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      select: {
        id: true,
        title: true,
      },
    });

    if (!existingTicket) {
      throw new NotFoundException('Ticket not found');
    }

    await this.activityService.logActivity({
      action: ActivityLogAction.TICKET_DELETED,
      entityType: ActivityEntityType.TICKET,
      entityId: existingTicket.id,
      actorId: requester.id,
      ticketId: existingTicket.id,
      metadata: {
        title: existingTicket.title,
      },
    });

    await this.prisma.$transaction(async (tx) => {
      await tx.ticketNote.deleteMany({
        where: { ticketId },
      });

      await tx.ticket.delete({
        where: { id: ticketId },
      });
    });
  }
}
