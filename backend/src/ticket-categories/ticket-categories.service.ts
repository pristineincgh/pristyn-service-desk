import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTicketCategoryDto } from './dto/create-ticket-category.dto';
import { UpdateTicketCategoryDto } from './dto/update-ticket-category.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TicketCategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createTicketCategoryDto: CreateTicketCategoryDto) {
    try {
      return await this.prisma.ticketCategory.create({
        data: { name: createTicketCategoryDto.name },
      });
    } catch {
      throw new BadRequestException('Category already exists');
    }
  }

  findAll() {
    return this.prisma.ticketCategory.findMany();
  }

  async findOne(id: string) {
    return this.prisma.ticketCategory.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateTicketCategoryDto: UpdateTicketCategoryDto) {
    const ticketCategory = await this.findOne(id);

    if (!ticketCategory) {
      throw new BadRequestException('Category not found');
    }

    return this.prisma.ticketCategory.update({
      where: { id },
      data: updateTicketCategoryDto,
    });
  }

  async remove(id: string) {
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

    await this.prisma.ticketCategory.delete({
      where: { id },
    });
  }
}
