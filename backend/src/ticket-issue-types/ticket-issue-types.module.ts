import { Module } from '@nestjs/common';
import { TicketIssueTypesService } from './ticket-issue-types.service';
import { TicketIssueTypesController } from './ticket-issue-types.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [AuthModule],
  providers: [TicketIssueTypesService, PrismaService],
  controllers: [TicketIssueTypesController],
})
export class TicketIssueTypesModule {}
