import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { PrismaService } from 'src/prisma.service';
import { AuthModule } from 'src/auth/auth.module';
import { ActivityModule } from 'src/activity/activity.module';

@Module({
  imports: [AuthModule, ActivityModule],
  providers: [CustomersService, PrismaService],
  controllers: [CustomersController],
})
export class CustomersModule {}
