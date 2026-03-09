import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma.service';
import { ConfigModule } from '@nestjs/config';
import { configuration, configValidationSchema } from './config/config';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { ActivityModule } from './activity/activity.module';
import { CustomersModule } from './customers/customers.module';
import { TicketIssueTypesModule } from './ticket-issue-types/ticket-issue-types.module';
import { TicketsModule } from './tickets/tickets.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: configValidationSchema,
    }),
    UsersModule,
    RedisModule,
    AuthModule,
    ActivityModule,
    CustomersModule,
    TicketIssueTypesModule,
    TicketsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
