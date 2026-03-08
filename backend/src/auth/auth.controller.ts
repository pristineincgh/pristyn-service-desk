import {
  Controller,
  Get,
  HttpCode,
  Post,
  Body,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AUTH_SESSION_ID_COOKIE } from './auth.constants';
import type { LoginResponse, LogoutResponse } from './types/response.types';
import { SessionAuthGuard } from './guards/session-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthenticatedUser, SafeUser } from './types/user.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponse> {
    const loginResult = await this.authService.login(dto);
    const { sessionId, ...responseBody } = loginResult;

    response.cookie(
      AUTH_SESSION_ID_COOKIE,
      sessionId,
      this.authService.getSessionIdCookieOptions(),
    );

    return responseBody;
  }

  @Get('me')
  @UseGuards(SessionAuthGuard)
  async getSession(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ user: SafeUser }> {
    const sessionUser = await this.authService.getSessionUser(user.sessionId);

    return {
      user: sessionUser,
    };
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(SessionAuthGuard)
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LogoutResponse> {
    await this.authService.logout(user.sessionId);
    response.clearCookie(
      AUTH_SESSION_ID_COOKIE,
      this.authService.getExpiredCookieOptions(),
    );

    return {
      message: 'Logout successful',
    };
  }
}
