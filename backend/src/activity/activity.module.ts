import { forwardRef, Module } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { PrismaService } from 'src/prisma.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [ActivityService, PrismaService],
  controllers: [ActivityController],
  exports: [ActivityService],
})
export class ActivityModule {}
