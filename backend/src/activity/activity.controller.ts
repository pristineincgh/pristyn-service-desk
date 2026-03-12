import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { SessionAuthGuard } from 'src/auth/guards/session-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/generated/prisma/enums';
import { FindActivitiesQueryDto } from './dto/find-activities-query.dto';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR)
  @Get()
  async getActivities(@Query() query: FindActivitiesQueryDto) {
    const result = await this.activityService.getActivities(query);

    return {
      ...result,
      generatedAt: new Date().toISOString(),
    };
  }

  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR)
  @Get('recent')
  async getRecentActivities(@Query('limit') limit?: string) {
    const parsedLimit = Number.parseInt(limit ?? '20', 10);
    const safeLimit = Number.isFinite(parsedLimit) ? parsedLimit : 20;
    const activities =
      await this.activityService.getRecentActivities(safeLimit);

    return {
      total: activities.length,
      generatedAt: new Date().toISOString(),
      activities,
    };
  }
}
