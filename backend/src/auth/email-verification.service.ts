import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'crypto';
import { MailService } from 'src/mail/mail.service';
import { EmailVerificationProps } from 'src/mail/mail-types';
import { PrismaService } from 'src/prisma.service';
import { UsersService } from 'src/users/users.service';
import { ActivityService } from 'src/activity/activity.service';
import {
  ActivityEntityType,
  ActivityLogAction,
} from 'src/generated/prisma/enums';

type SendEmailVerificationOptions = {
  credentials?: EmailVerificationProps['htmlProps']['credentials'];
  actorId?: string | null;
  reason?: string;
};

type SendEmailVerificationResult = {
  expiresAt: string;
  verificationUrl: string;
};

type VerifyEmailResult = {
  message: string;
};

@Injectable()
export class EmailVerificationService {
  private readonly tokenTTLSeconds: number;
  private readonly verificationPath: string;
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
      'emailVerification.ttlSeconds',
      60 * 60 * 24,
    );
    this.verificationPath = this.configService.get<string>(
      'emailVerification.path',
      '/verify-email',
    );
    this.frontendBaseUrl = this.configService.get<string>(
      'emailVerification.frontendBaseUrl',
      this.configService.get<string>('cors.origin', 'http://localhost:3000'),
    );
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private buildVerificationUrl(token: string) {
    const normalizedBaseUrl = this.frontendBaseUrl.replace(/\/+$/, '');
    const normalizedPath = this.verificationPath.startsWith('/')
      ? this.verificationPath
      : `/${this.verificationPath}`;

    return `${normalizedBaseUrl}${normalizedPath}?token=${encodeURIComponent(token)}`;
  }

  private async clearExistingTokensForUser(userId: string) {
    await this.prisma.emailVerificationToken.deleteMany({
      where: {
        userId,
      },
    });
  }

  async sendVerificationEmail(
    userId: string,
    options: SendEmailVerificationOptions = {},
  ): Promise<SendEmailVerificationResult> {
    const user = await this.usersService.findPublicById(userId);

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    await this.clearExistingTokensForUser(user.id);

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + this.tokenTTLSeconds * 1000);
    const verificationUrl = this.buildVerificationUrl(rawToken);

    await this.prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    await this.mailService.sendEmailVerification({
      receiverEmail: user.email,
      htmlProps: {
        verificationURL: verificationUrl,
        firstName: user.name,
        credentials: options.credentials ?? {
          email: '',
          password: '',
        },
      },
    });

    await this.activityService.logActivity({
      action: ActivityLogAction.USER_VERIFICATION_EMAIL_SENT,
      entityType: ActivityEntityType.USER,
      entityId: user.id,
      actorId: options.actorId ?? null,
      userId: user.id,
      metadata: {
        email: user.email,
        expiresAt: expiresAt.toISOString(),
        reason: options.reason ?? 'manual',
      },
    });

    return {
      expiresAt: expiresAt.toISOString(),
      verificationUrl,
    };
  }

  async verifyEmail(token: string): Promise<VerifyEmailResult> {
    const normalizedToken = token.trim();

    if (!normalizedToken) {
      throw new BadRequestException('Verification token is required');
    }

    const tokenHash = this.hashToken(normalizedToken);
    const verificationToken =
      await this.prisma.emailVerificationToken.findUnique({
        where: {
          tokenHash,
        },
      });

    if (!verificationToken || verificationToken.usedAt) {
      throw new BadRequestException('Verification token is invalid or expired');
    }

    if (verificationToken.expiresAt.getTime() <= Date.now()) {
      await this.prisma.emailVerificationToken.delete({
        where: {
          id: verificationToken.id,
        },
      });

      throw new BadRequestException('Verification token has expired');
    }

    const user = await this.usersService.findById(verificationToken.userId);

    if (!user) {
      await this.prisma.emailVerificationToken.delete({
        where: {
          id: verificationToken.id,
        },
      });

      throw new NotFoundException('User does not exist');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          emailVerified: true,
        },
      }),
      this.prisma.emailVerificationToken.update({
        where: {
          id: verificationToken.id,
        },
        data: {
          usedAt: new Date(),
        },
      }),
      this.prisma.emailVerificationToken.deleteMany({
        where: {
          userId: user.id,
          id: {
            not: verificationToken.id,
          },
        },
      }),
    ]);

    await this.activityService.logActivity({
      action: ActivityLogAction.USER_EMAIL_VERIFIED,
      entityType: ActivityEntityType.USER,
      entityId: user.id,
      actorId: user.id,
      userId: user.id,
      metadata: {
        email: user.email,
      },
    });

    return {
      message: 'Email verified successfully',
    };
  }

  async markEmailAsUnverified(userId: string) {
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          emailVerified: false,
        },
      }),
      this.prisma.emailVerificationToken.deleteMany({
        where: {
          userId,
        },
      }),
    ]);
  }
}
