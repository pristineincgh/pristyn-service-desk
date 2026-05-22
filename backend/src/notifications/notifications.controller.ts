import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SessionAuthGuard } from 'src/auth/guards/session-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/auth/types/user.types';
import { NotificationsService } from './notifications.service';
import { FindNotificationsQueryDto } from './dto/find-notifications-query.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(SessionAuthGuard)
  @Get()
  async getNotifications(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: FindNotificationsQueryDto,
  ) {
    return this.notificationsService.getNotifications(
      user.id,
      query.page,
      query.limit,
    );
  }

  @UseGuards(SessionAuthGuard)
  @Get('unread-count')
  async getUnreadCount(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.getUnreadCount(user.id);
  }

  @UseGuards(SessionAuthGuard)
  @Patch('read-all')
  async markAllAsRead(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @UseGuards(SessionAuthGuard)
  @Patch(':id/read')
  async markAsRead(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.notificationsService.markAsRead(user.id, id);
  }
}
