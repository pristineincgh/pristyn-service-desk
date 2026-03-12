import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { StringValue } from 'ms';
import { UsersModule } from 'src/users/users.module';
import { SessionAuthGuard } from './guards/session-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { ActivityModule } from 'src/activity/activity.module';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.accessSecret'),
        signOptions: {
          expiresIn: configService.get<string>(
            'jwt.accessTokenTTL',
          ) as StringValue,
        },
      }),
    }),
    forwardRef(() => UsersModule),
    forwardRef(() => ActivityModule),
  ],
  providers: [AuthService, SessionAuthGuard, RolesGuard],
  controllers: [AuthController],
  exports: [AuthService, SessionAuthGuard, RolesGuard],
})
export class AuthModule {}
