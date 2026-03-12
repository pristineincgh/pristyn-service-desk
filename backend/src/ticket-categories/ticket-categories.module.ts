import { Module } from '@nestjs/common';
import { TicketCategoriesService } from './ticket-categories.service';
import { TicketCategoriesController } from './ticket-categories.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from 'src/prisma.service';
import { ActivityModule } from 'src/activity/activity.module';

@Module({
  imports: [AuthModule, ActivityModule],
  providers: [TicketCategoriesService, PrismaService],
  controllers: [TicketCategoriesController],
})
export class TicketCategoriesModule {}
