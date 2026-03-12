import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ActivityService } from 'src/activity/activity.service';
import { Prisma } from 'src/generated/prisma/client';
import {
  ActivityEntityType,
  ActivityLogAction,
} from 'src/generated/prisma/enums';
import { PrismaService } from 'src/prisma.service';

export type CreateCustomerInput = {
  name: string;
  email?: string;
  phone: string;
};

export type UpdateCustomerInput = Partial<CreateCustomerInput>;

const CUSTOMER_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  createdAt: true,
  updatedAt: true,
} as const;

const CUSTOMER_DETAIL_SELECT = {
  ...CUSTOMER_SELECT,
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
      ticketCategory: {
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
export class CustomersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityService: ActivityService,
  ) {}

  private normalizeName(name: string) {
    return name.trim();
  }

  private normalizePhone(phone: string) {
    return phone.trim();
  }

  private normalizeEmail(email?: string) {
    const normalized = email?.trim().toLowerCase();

    return normalized && normalized.length > 0 ? normalized : undefined;
  }

  private async ensureCustomerExists(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
  }

  private async ensureUniqueCustomerFields(input: {
    phone?: string;
    email?: string;
    excludeCustomerId?: string;
  }) {
    const { phone, email, excludeCustomerId } = input;

    if (!phone && !email) {
      return;
    }

    const duplicate = await this.prisma.customer.findFirst({
      where: {
        ...(excludeCustomerId ? { id: { not: excludeCustomerId } } : {}),
        OR: [...(phone ? [{ phone }] : []), ...(email ? [{ email }] : [])],
      },
      select: {
        id: true,
        phone: true,
        email: true,
      },
    });

    if (!duplicate) {
      return;
    }

    if (phone && duplicate.phone === phone) {
      throw new ConflictException('Customer with this phone already exists');
    }

    if (email && duplicate.email === email) {
      throw new ConflictException('Customer with this email already exists');
    }
  }

  async createCustomer(input: CreateCustomerInput, actorId: string) {
    const name = this.normalizeName(input.name);
    const phone = this.normalizePhone(input.phone);
    const email = this.normalizeEmail(input.email);

    await this.ensureUniqueCustomerFields({ phone, email });

    const customer = await this.prisma.customer.create({
      data: {
        name,
        email,
        phone,
      },
      select: CUSTOMER_SELECT,
    });

    await this.activityService.logActivity({
      action: ActivityLogAction.CUSTOMER_CREATED,
      entityType: ActivityEntityType.CUSTOMER,
      entityId: customer.id,
      actorId,
      metadata: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
    });

    return customer;
  }

  async findAllCustomers(search?: string) {
    const term = search?.trim();

    return this.prisma.customer.findMany({
      where: term
        ? {
            OR: [
              {
                name: {
                  contains: term,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                email: {
                  contains: term,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                phone: {
                  contains: term,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            ],
          }
        : undefined,
      orderBy: {
        createdAt: 'desc',
      },
      select: CUSTOMER_SELECT,
    });
  }

  async findCustomerById(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      select: CUSTOMER_DETAIL_SELECT,
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async updateCustomer(
    id: string,
    input: UpdateCustomerInput,
    actorId: string,
  ) {
    const existingCustomer = await this.prisma.customer.findUnique({
      where: { id },
      select: CUSTOMER_SELECT,
    });

    if (!existingCustomer) {
      throw new NotFoundException('Customer not found');
    }

    const normalizedName =
      input.name !== undefined ? this.normalizeName(input.name) : undefined;
    const normalizedPhone =
      input.phone !== undefined ? this.normalizePhone(input.phone) : undefined;
    const normalizedEmail =
      input.email !== undefined ? this.normalizeEmail(input.email) : undefined;

    if (
      normalizedName === undefined &&
      normalizedPhone === undefined &&
      normalizedEmail === undefined
    ) {
      throw new BadRequestException('No fields were provided for update');
    }

    await this.ensureUniqueCustomerFields({
      phone: normalizedPhone,
      email: normalizedEmail,
      excludeCustomerId: id,
    });

    const customer = await this.prisma.customer.update({
      where: { id },
      data: {
        ...(normalizedName !== undefined ? { name: normalizedName } : {}),
        ...(normalizedPhone !== undefined ? { phone: normalizedPhone } : {}),
        ...(normalizedEmail !== undefined ? { email: normalizedEmail } : {}),
      },
      select: CUSTOMER_SELECT,
    });

    const changedFields = Object.entries(input)
      .filter(([, value]) => value !== undefined)
      .map(([key]) => key);

    if (changedFields.length > 0) {
      await this.activityService.logActivity({
        action: ActivityLogAction.CUSTOMER_UPDATED,
        entityType: ActivityEntityType.CUSTOMER,
        entityId: customer.id,
        actorId,
        metadata: {
          changedFields,
          previous: {
            name: existingCustomer.name,
            email: existingCustomer.email,
            phone: existingCustomer.phone,
          },
          current: {
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
          },
        },
      });
    }

    return customer;
  }

  async deleteCustomer(id: string, actorId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      select: CUSTOMER_SELECT,
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const ticketCount = await this.prisma.ticket.count({
      where: { customerId: id },
    });

    if (ticketCount > 0) {
      throw new BadRequestException(
        'Cannot delete customer because tickets are linked to this customer',
      );
    }

    await this.activityService.logActivity({
      action: ActivityLogAction.CUSTOMER_DELETED,
      entityType: ActivityEntityType.CUSTOMER,
      entityId: customer.id,
      actorId,
      metadata: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
    });

    await this.prisma.customer.delete({
      where: { id },
    });
  }
}
