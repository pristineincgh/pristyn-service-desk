import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TicketCategoriesService } from './ticket-categories.service';
import { CreateTicketCategoryDto } from './dto/create-ticket-category.dto';
import { UpdateTicketCategoryDto } from './dto/update-ticket-category.dto';
import { SessionAuthGuard } from 'src/auth/guards/session-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/auth/types/user.types';
import { UserRole } from 'src/generated/prisma/enums';

@Controller('ticket-categories')
export class TicketCategoriesController {
  constructor(
    private readonly ticketCategoriesService: TicketCategoriesService,
  ) {}

  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR)
  @Post()
  create(
    @Body() createTicketCategoryDto: CreateTicketCategoryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ticketCategoriesService.create(
      createTicketCategoryDto,
      user.id,
    );
  }

  @Get()
  async findAll() {
    const categories = await this.ticketCategoriesService.findAll();

    return {
      total: categories.length,
      categories,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.ticketCategoriesService.findOne(id);
  }

  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTicketCategoryDto: UpdateTicketCategoryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const updatedCategory = await this.ticketCategoriesService.update(
      id,
      updateTicketCategoryDto,
      user.id,
    );

    return {
      message: 'Updated ticket category',
      data: updatedCategory,
    };
  }

  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.ticketCategoriesService.remove(id, user.id);

    return {
      message: 'Category removed',
    };
  }
}
