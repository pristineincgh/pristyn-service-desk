import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from 'src/prisma.service';
import { UsersBootstrapService } from './users-bootstrap.service';
import { ActivityModule } from 'src/activity/activity.module';
import { MailModule } from 'src/mail/mail.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    ActivityModule,
    MailModule,
    NotificationsModule,
  ],
  providers: [UsersService, PrismaService, UsersBootstrapService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
