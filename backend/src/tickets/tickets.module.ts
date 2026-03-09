import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from 'src/prisma.service';
import { UsersModule } from 'src/users/users.module';
import { ActivityModule } from 'src/activity/activity.module';

@Module({
  imports: [ActivityModule, AuthModule, UsersModule],
  providers: [TicketsService, PrismaService],
  controllers: [TicketsController],
  exports: [TicketsService],
})
export class TicketsModule {}
