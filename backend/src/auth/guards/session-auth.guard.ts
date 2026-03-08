import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../auth.service';
import { AUTH_SESSION_ID_COOKIE } from '../auth.constants';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const sessionId = request.signedCookies?.[AUTH_SESSION_ID_COOKIE];

    if (!sessionId) {
      throw new UnauthorizedException('Missing session cookie');
    }

    const session = await this.authService.validateSession(sessionId);
    request.user = session.user;

    if (session.tokens) {
      request.authTokens = {
        sessionId: session.sessionId,
      };
    }

    return true;
  }
}
