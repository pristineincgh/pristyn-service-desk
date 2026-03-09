import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { SessionAuthGuard } from 'src/auth/guards/session-auth.guard';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/auth/types/user.types';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { FindAllTicketsQueryDto } from './dto/find-all-tickets-query.dto';
import { BulkReassignTicketsDto } from './dto/bulk-reassign-tickets.dto';
import { BulkUpdateTicketStatusDto } from './dto/bulk-update-ticket-status.dto';
import { BulkDeleteTicketsDto } from './dto/bulk-delete-tickets.dto';
import { CreateTicketNoteDto } from './dto/create-ticket-note.dto';
import { UpdateTicketNoteDto } from './dto/update-ticket-note.dto';

@Controller('tickets')
export class TicketsController {
  constructor(private ticketService: TicketsService) {}

  @UseGuards(SessionAuthGuard)
  @Post('new-ticket')
  async createTicket(
    @Body() dto: CreateTicketDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Ticket created successfully',
      ticket: await this.ticketService.createTicket(dto, user.id),
    };
  }

  @UseGuards(SessionAuthGuard)
  @Get()
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: FindAllTicketsQueryDto,
  ) {
    return this.ticketService.findAllTickets(user.id, query);
  }

  @UseGuards(SessionAuthGuard)
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.ticketService.findTicketById(id, user.id);
  }

  @UseGuards(SessionAuthGuard)
  @Patch('bulk/reassign')
  async bulkReassign(
    @Body() dto: BulkReassignTicketsDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const result = await this.ticketService.bulkReassignTickets(dto, user.id);

    return {
      message: 'Tickets reassigned successfully',
      ...result,
    };
  }

  @UseGuards(SessionAuthGuard)
  @Patch('bulk/status')
  async bulkUpdateStatus(
    @Body() dto: BulkUpdateTicketStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const result = await this.ticketService.bulkUpdateTicketStatus(
      dto,
      user.id,
    );

    return {
      message: 'Ticket statuses updated successfully',
      ...result,
    };
  }

  @UseGuards(SessionAuthGuard)
  @Get(':ticketId/notes')
  async findTicketNotes(
    @Param('ticketId') ticketId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      ticketId,
      notes: await this.ticketService.findTicketNotes(ticketId, user.id),
    };
  }

  @UseGuards(SessionAuthGuard)
  @Post(':ticketId/notes')
  async createTicketNote(
    @Param('ticketId') ticketId: string,
    @Body() dto: CreateTicketNoteDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Ticket note added successfully',
      note: await this.ticketService.createTicketNote(ticketId, dto, user.id),
    };
  }

  @UseGuards(SessionAuthGuard)
  @Patch(':ticketId/notes/:noteId')
  async updateTicketNote(
    @Param('ticketId') ticketId: string,
    @Param('noteId') noteId: string,
    @Body() dto: UpdateTicketNoteDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      message: 'Ticket note updated successfully',
      note: await this.ticketService.updateTicketNote(
        ticketId,
        noteId,
        dto,
        user.id,
      ),
    };
  }

  @UseGuards(SessionAuthGuard)
  @Delete(':ticketId/notes/:noteId')
  async deleteTicketNote(
    @Param('ticketId') ticketId: string,
    @Param('noteId') noteId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.ticketService.deleteTicketNote(ticketId, noteId, user.id);

    return {
      message: 'Ticket note deleted successfully',
    };
  }

  @UseGuards(SessionAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTicketDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const updatedTicket = await this.ticketService.updateTicket(
      id,
      dto,
      user.id,
    );

    return {
      message: 'Ticket updated successfully',
      ticket: updatedTicket,
    };
  }

  @UseGuards(SessionAuthGuard)
  @Delete('bulk')
  async bulkRemove(
    @Body() dto: BulkDeleteTicketsDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const result = await this.ticketService.bulkDeleteTickets(dto, user.id);

    return {
      message: 'Tickets deleted successfully',
      ...result,
    };
  }

  @UseGuards(SessionAuthGuard)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.ticketService.deleteTicket(id, user.id);

    return {
      message: 'Ticket deleted successfully',
    };
  }
}
