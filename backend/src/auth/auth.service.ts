import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { StringValue } from 'ms';
import { AuthenticatedUser, SafeUser, SessionUser } from './types/user.types';
import { RedisService } from 'src/redis/redis.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';
import {
  ActivityEntityType,
  ActivityLogAction,
  UserRole,
  UserStatus,
} from 'src/generated/prisma/enums';
import { TokenExpiredError } from 'jsonwebtoken';
import type { LoginResponse, TokenPair } from './types/response.types';
import type { CookieOptions } from 'express';
import { ActivityService } from 'src/activity/activity.service';

interface SessionData {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  accessToken: string;
  refreshToken: string;
  createdAt: Date;
  lastActivityAt: Date;
}

interface ValidatedSessionResult {
  user: AuthenticatedUser;
  sessionId: string;
  tokens?: TokenPair;
}

interface LoginResult extends LoginResponse {
  sessionId: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly sessionPrefix: string;
  private readonly sessionExpiry: number;
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessTokenTTL: StringValue;
  private readonly refreshTokenTTL: StringValue;
  private readonly cookieDomain?: string;
  private readonly cookieSecure: boolean;
  private readonly cookieSameSite: 'lax' | 'strict' | 'none';

  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private configService: ConfigService,
    private cacheService: RedisService,
    @Inject(forwardRef(() => ActivityService))
    private readonly activityService: ActivityService,
  ) {
    this.sessionPrefix = this.configService.get<string>(
      'session.prefix',
      'sid:',
    );
    this.sessionExpiry = this.configService.get<number>(
      'session.expiry',
      604800,
    );
    this.accessSecret = this.configService.get<string>('jwt.accessSecret', '');
    this.refreshSecret = this.configService.get<string>(
      'jwt.refreshSecret',
      '',
    );
    this.accessTokenTTL = this.configService.get<string>(
      'jwt.accessTokenTTL',
    ) as StringValue;
    this.refreshTokenTTL = this.configService.get<string>(
      'jwt.refreshTokenTTL',
    ) as StringValue;
    this.cookieDomain = this.configService.get<string | undefined>(
      'cookie.domain',
    );
    this.cookieSecure = this.configService.get<boolean>('cookie.secure', false);
    this.cookieSameSite = this.configService.get<'lax' | 'strict' | 'none'>(
      'cookie.sameSite',
      'lax',
    );
  }

  private getSessionCacheKey(sessionId: string) {
    return `${this.sessionPrefix}${sessionId}`;
  }

  private buildSessionPayload(user: SafeUser, sessionId: string): SessionUser {
    return {
      sub: user.id,
      email: user.email,
      role: user.role,
      sessionId,
    };
  }

  private buildAuthenticatedUser(
    user: Pick<SafeUser, 'id' | 'email' | 'name' | 'role'>,
    sessionId: string,
  ): AuthenticatedUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      sessionId,
    };
  }

  private async generateTokenPair(payload: SessionUser): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.accessSecret,
        expiresIn: this.accessTokenTTL,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.refreshSecret,
        expiresIn: this.refreshTokenTTL,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async saveSession(
    sessionId: string,
    data: SessionData,
  ): Promise<void> {
    await this.cacheService.set(
      this.getSessionCacheKey(sessionId),
      data,
      this.sessionExpiry * 1000,
    );
  }

  private async getSession(
    sessionId: string,
  ): Promise<SessionData | undefined> {
    return this.cacheService.get<SessionData>(
      this.getSessionCacheKey(sessionId),
    );
  }

  private async deleteSession(sessionId: string): Promise<void> {
    await this.cacheService.del(this.getSessionCacheKey(sessionId));
  }

  private async verifyAccessToken(
    accessToken: string,
  ): Promise<{ payload: SessionUser; expired: boolean }> {
    try {
      const payload = await this.jwtService.verifyAsync<SessionUser>(
        accessToken,
        {
          secret: this.accessSecret,
        },
      );

      return { payload, expired: false };
    } catch (error) {
      if (!(error instanceof TokenExpiredError)) {
        throw new UnauthorizedException('Invalid access token');
      }

      const payload = await this.jwtService.verifyAsync<SessionUser>(
        accessToken,
        {
          secret: this.accessSecret,
          ignoreExpiration: true,
        },
      );

      return { payload, expired: true };
    }
  }

  private async rotateSessionTokens(
    sessionId: string,
    session: SessionData,
  ): Promise<TokenPair> {
    const refreshPayload = await this.jwtService.verifyAsync<SessionUser>(
      session.refreshToken,
      {
        secret: this.refreshSecret,
      },
    );

    if (
      refreshPayload.sessionId !== sessionId ||
      refreshPayload.sub !== session.userId
    ) {
      await this.deleteSession(sessionId);
      throw new UnauthorizedException('Invalid session refresh token');
    }

    const user = await this.usersService.findPublicById(session.userId);
    const payload = this.buildSessionPayload(user, sessionId);
    const tokens = await this.generateTokenPair(payload);

    await this.saveSession(sessionId, {
      ...session,
      email: user.email,
      name: user.name,
      role: user.role,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      lastActivityAt: new Date(),
    });

    return tokens;
  }

  getSessionIdCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      signed: true,
      secure: this.cookieSecure,
      sameSite: this.cookieSameSite,
      domain: this.cookieDomain,
      path: '/',
      maxAge: this.sessionExpiry * 1000,
    };
  }

  getExpiredCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      signed: true,
      secure: this.cookieSecure,
      sameSite: this.cookieSameSite,
      domain: this.cookieDomain,
      path: '/',
      expires: new Date(0),
    };
  }

  async login(dto: LoginDto): Promise<LoginResult> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('User account is inactive');
    }

    const safeUser = await this.usersService.findPublicById(user.id);
    const sessionId = randomUUID();
    const payload = this.buildSessionPayload(safeUser, sessionId);
    const tokens = await this.generateTokenPair(payload);

    await this.saveSession(sessionId, {
      userId: safeUser.id,
      email: safeUser.email,
      name: safeUser.name,
      role: safeUser.role,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      createdAt: new Date(),
      lastActivityAt: new Date(),
    });

    this.logger.log(`Created session ${sessionId} for user ${safeUser.id}`);

    await this.activityService.logActivity({
      action: ActivityLogAction.USER_LOGGED_IN,
      entityType: ActivityEntityType.USER,
      entityId: safeUser.id,
      actorId: safeUser.id,
      userId: safeUser.id,
      metadata: {
        sessionId,
      },
    });

    return {
      message: 'Login successful',
      user: safeUser,
      sessionId,
    };
  }

  async validateSession(sessionId: string): Promise<ValidatedSessionResult> {
    const session = await this.getSession(sessionId);

    if (!session) {
      throw new UnauthorizedException('Session does not exist or has expired');
    }

    const { payload, expired } = await this.verifyAccessToken(
      session.accessToken,
    );

    if (payload.sessionId !== sessionId || payload.sub !== session.userId) {
      await this.deleteSession(sessionId);
      throw new UnauthorizedException('Session token mismatch');
    }

    const userRecord = await this.usersService.findById(session.userId);
    if (!userRecord) {
      await this.deleteSession(sessionId);
      throw new UnauthorizedException('User does not exist');
    }

    if (userRecord.status !== UserStatus.ACTIVE) {
      await this.deleteSession(sessionId);
      throw new UnauthorizedException('User account is inactive');
    }

    const user = this.buildAuthenticatedUser(userRecord, sessionId);

    if (!expired) {
      await this.saveSession(sessionId, {
        ...session,
        lastActivityAt: new Date(),
      });

      return {
        user,
        sessionId,
      };
    }

    try {
      const tokens = await this.rotateSessionTokens(sessionId, session);

      return {
        user,
        sessionId,
        tokens,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      await this.deleteSession(sessionId);
      throw new UnauthorizedException('Unable to refresh expired session');
    }
  }

  async getSessionUser(sessionId: string): Promise<SafeUser> {
    const session = await this.getSession(sessionId);

    if (!session) {
      throw new UnauthorizedException('Session does not exist or has expired');
    }

    return this.usersService.findPublicById(session.userId);
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<SafeUser> {
    return this.usersService.updateOwnProfile(userId, dto);
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User does not exist');
    }

    const passwordMatches = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.usersService.updatePasswordHash(userId, hashedPassword);
  }

  async logout(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);

    await this.deleteSession(sessionId);
    this.logger.log(`Deleted session ${sessionId}`);

    if (!session) {
      return;
    }

    await this.activityService.logActivity({
      action: ActivityLogAction.USER_LOGGED_OUT,
      entityType: ActivityEntityType.USER,
      entityId: session.userId,
      actorId: session.userId,
      userId: session.userId,
      metadata: {
        sessionId,
      },
    });
  }
}
