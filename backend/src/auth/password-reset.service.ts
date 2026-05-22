import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'crypto';
import { ActivityService } from 'src/activity/activity.service';
import {
  ActivityEntityType,
  ActivityLogAction,
} from 'src/generated/prisma/enums';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class PasswordResetService {
  private readonly passwordResetRequestedAction =
    'USER_PASSWORD_RESET_REQUESTED' as ActivityLogAction;
  private readonly passwordResetCompletedAction =
    'USER_PASSWORD_RESET_COMPLETED' as ActivityLogAction;
  private readonly tokenTTLSeconds: number;
  private readonly resetPath: string;
  private readonly frontendBaseUrl: string;

  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly activityService: ActivityService,
  ) {
    this.tokenTTLSeconds = this.configService.get<number>(
      'passwordReset.ttlSeconds',
      60 * 30,
    );
    this.resetPath = this.configService.get<string>(
      'passwordReset.path',
      '/reset-password',
    );
    this.frontendBaseUrl = this.configService.get<string>(
      'passwordReset.frontendBaseUrl',
      this.configService.get<string>('cors.origin', 'http://localhost:3000'),
    );
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private buildResetUrl(token: string) {
    const normalizedBaseUrl = this.frontendBaseUrl.replace(/\/+$/, '');
    const normalizedPath = this.resetPath.startsWith('/')
      ? this.resetPath
      : `/${this.resetPath}`;

    return `${normalizedBaseUrl}${normalizedPath}?token=${encodeURIComponent(token)}`;
  }

  private async clearExistingTokensForUser(userId: string) {
    await this.prisma.passwordResetToken.deleteMany({
      where: { userId },
    });
  }

  async requestPasswordReset(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.usersService.findByEmail(normalizedEmail);

    if (!user || user.status !== 'ACTIVE') {
      return {
        message:
          'If an account with that email exists, a password reset link has been sent.',
      };
    }

    await this.clearExistingTokensForUser(user.id);

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + this.tokenTTLSeconds * 1000);
    const resetUrl = this.buildResetUrl(rawToken);

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    await this.mailService.sendForgotPasswordEmail({
      receiverEmail: user.email,
      htmlProps: {
        firstName: user.name,
        resetUrl,
      },
    });

    await this.activityService.logActivity({
      action: this.passwordResetRequestedAction,
      entityType: ActivityEntityType.USER,
      entityId: user.id,
      actorId: null,
      userId: user.id,
      metadata: {
        email: user.email,
        expiresAt: expiresAt.toISOString(),
      },
    });

    return {
      message:
        'If an account with that email exists, a password reset link has been sent.',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const normalizedToken = token.trim();

    if (!normalizedToken) {
      throw new BadRequestException('Password reset token is required');
    }

    const tokenHash = this.hashToken(normalizedToken);
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!resetToken || resetToken.usedAt) {
      throw new BadRequestException(
        'Password reset token is invalid or expired',
      );
    }

    if (resetToken.expiresAt.getTime() <= Date.now()) {
      await this.prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      });
      throw new BadRequestException('Password reset token has expired');
    }

    const user = await this.usersService.findById(resetToken.userId);

    if (!user) {
      await this.prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      });
      throw new NotFoundException('User does not exist');
    }

    const passwordMatches = await this.usersService.passwordMatches(
      newPassword,
      user.password,
    );

    if (passwordMatches) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    const hashedPassword = await this.usersService.hashPassword(newPassword);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          mustChangePassword: false,
          passwordUpdatedAt: new Date(),
        },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.passwordResetToken.deleteMany({
        where: {
          userId: user.id,
          id: {
            not: resetToken.id,
          },
        },
      }),
    ]);

    await this.mailService.sendPasswordChangedConfirmation({
      receiverEmail: user.email,
      htmlProps: {
        firstName: user.name,
      },
    });

    await this.activityService.logActivity({
      action: this.passwordResetCompletedAction,
      entityType: ActivityEntityType.USER,
      entityId: user.id,
      actorId: user.id,
      userId: user.id,
      metadata: {
        email: user.email,
      },
    });

    return {
      message: 'Password reset successfully',
    };
  }
}
