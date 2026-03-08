import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
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

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

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

  async createCustomer(input: CreateCustomerInput) {
    const name = this.normalizeName(input.name);
    const phone = this.normalizePhone(input.phone);
    const email = this.normalizeEmail(input.email);

    await this.ensureUniqueCustomerFields({ phone, email });

    return this.prisma.customer.create({
      data: {
        name,
        email,
        phone,
      },
      select: CUSTOMER_SELECT,
    });
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
      select: CUSTOMER_SELECT,
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async updateCustomer(id: string, input: UpdateCustomerInput) {
    await this.ensureCustomerExists(id);

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

    return this.prisma.customer.update({
      where: { id },
      data: {
        ...(normalizedName !== undefined ? { name: normalizedName } : {}),
        ...(normalizedPhone !== undefined ? { phone: normalizedPhone } : {}),
        ...(normalizedEmail !== undefined ? { email: normalizedEmail } : {}),
      },
      select: CUSTOMER_SELECT,
    });
  }

  async deleteCustomer(id: string) {
    await this.ensureCustomerExists(id);

    const ticketCount = await this.prisma.ticket.count({
      where: { customerId: id },
    });

    if (ticketCount > 0) {
      throw new BadRequestException(
        'Cannot delete customer because tickets are linked to this customer',
      );
    }

    await this.prisma.customer.delete({
      where: { id },
    });
  }
}
