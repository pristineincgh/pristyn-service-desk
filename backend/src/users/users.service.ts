import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { AssignAgentDto } from './dto/assign-agent.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { User } from 'src/generated/prisma/client';
import {
  ActivityEntityType,
  ActivityLogAction,
  UserRole,
  UserStatus,
} from 'src/generated/prisma/enums';
import { PrismaService } from 'src/prisma.service';
import { SafeUser } from 'src/auth/types/user.types';
import { ActivityService } from 'src/activity/activity.service';
import { EmailVerificationService } from 'src/auth/email-verification.service';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly activityService: ActivityService,
    @Inject(forwardRef(() => EmailVerificationService))
    private readonly emailVerificationService: EmailVerificationService,
    private readonly mailService: MailService,
  ) {}

  private readonly safeUserSelect = {
    id: true,
    name: true,
    email: true,
    passwordUpdatedAt: true,
    role: true,
    phone: true,
    status: true,
    emailVerified: true,
    mustChangePassword: true,
    supervisorId: true,
    createdAt: true,
    updatedAt: true,
  } as const;

  private getRandomCharacter(charset: string) {
    return charset[randomInt(0, charset.length)];
  }

  private normalizeOptionalString(value?: string | null) {
    if (value === undefined) {
      return undefined;
    }

    if (value === null) {
      return null;
    }

    const normalized = value.trim();

    return normalized.length > 0 ? normalized : null;
  }

  private generateUserDefaultPassword() {
    // 12 chars with at least one lowercase, uppercase, digit and symbol.
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const all = `${lowercase}${uppercase}${digits}${symbols}`;

    const passwordCharacters = [
      this.getRandomCharacter(lowercase),
      this.getRandomCharacter(uppercase),
      this.getRandomCharacter(digits),
      this.getRandomCharacter(symbols),
    ];

    while (passwordCharacters.length < 12) {
      passwordCharacters.push(this.getRandomCharacter(all));
    }

    for (let i = passwordCharacters.length - 1; i > 0; i--) {
      const j = randomInt(0, i + 1);
      [passwordCharacters[i], passwordCharacters[j]] = [
        passwordCharacters[j],
        passwordCharacters[i],
      ];
    }

    return passwordCharacters.join('');
  }

  async hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  async passwordMatches(candidatePassword: string, passwordHash: string) {
    return bcrypt.compare(candidatePassword, passwordHash);
  }

  async ensureModeratorAccount(input: {
    email: string;
    password: string;
    name: string;
  }) {
    const existingUser = await this.findByEmail(input.email);

    if (existingUser) {
      this.logger.log(
        `Moderator bootstrap skipped because ${input.email} already exists.`,
      );
      return existingUser;
    }

    const hashedPassword = await this.hashPassword(input.password);

    const moderator = await this.prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: hashedPassword,
        role: UserRole.MODERATOR,
        emailVerified: true,
        mustChangePassword: false,
      },
      select: this.safeUserSelect,
    });

    this.logger.log(`Bootstrapped moderator account for ${input.email}.`);

    return moderator;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  // Safer methods to get user data without sensitive information
  async findPublicByEmail(email: string): Promise<SafeUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: this.safeUserSelect,
    });

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    return user;
  }

  async findPublicById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.safeUserSelect,
    });

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    return user;
  }

  async getAllUsers() {
    const total = await this.prisma.user.count();
    const users = await this.prisma.user.findMany({
      select: this.safeUserSelect,
    });

    return { total, users };
  }

  async getAllActiveUsers() {
    const total = await this.prisma.user.count({
      where: {
        status: 'ACTIVE',
      },
    });

    const users = await this.prisma.user.findMany({
      where: {
        status: 'ACTIVE',
      },
      select: this.safeUserSelect,
    });

    return {
      total,
      users,
    };
  }

  async getAllInActiveUsers() {
    const total = await this.prisma.user.count({
      where: {
        status: 'INACTIVE',
      },
    });

    const users = await this.prisma.user.findMany({
      where: {
        status: 'INACTIVE',
      },
      select: this.safeUserSelect,
    });

    return {
      total,
      users,
    };
  }

  async createUser(dto: CreateUserDto, actorId?: string) {
    const existingUser = await this.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const defaultPassword = this.generateUserDefaultPassword();
    const hashedPassword = await this.hashPassword(defaultPassword);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: dto.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    await this.activityService.logActivity({
      action: ActivityLogAction.USER_CREATED,
      entityType: ActivityEntityType.USER,
      entityId: user.id,
      actorId: actorId ?? null,
      userId: user.id,
      metadata: {
        role: user.role,
        email: user.email,
      },
    });

    await this.emailVerificationService.sendVerificationEmail(user.id, {
      actorId: actorId ?? null,
      reason: 'user_created',
      credentials: {
        email: user.email,
        password: defaultPassword,
      },
    });

    return {
      user,
      defaultPassword,
    };
  }

  async assignAgentToSupervisor(
    agentId: string,
    dto: AssignAgentDto,
    actorId?: string,
  ) {
    if (agentId === dto.supervisorId) {
      throw new BadRequestException(
        'Agent and supervisor cannot be the same user',
      );
    }

    const [agent, supervisor] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: agentId },
        select: {
          id: true,
          role: true,
        },
      }),
      this.prisma.user.findUnique({
        where: { id: dto.supervisorId },
        select: {
          id: true,
          role: true,
          status: true,
        },
      }),
    ]);

    if (!agent) {
      throw new NotFoundException('Agent does not exist');
    }

    if (!supervisor) {
      throw new NotFoundException('Supervisor does not exist');
    }

    if (agent.role !== UserRole.AGENT) {
      throw new BadRequestException('User to assign must be an agent');
    }

    if (supervisor.role !== UserRole.SUPERVISOR) {
      throw new BadRequestException(
        'Assigned supervisor must have SUPERVISOR role',
      );
    }

    if (supervisor.status !== UserStatus.ACTIVE) {
      throw new BadRequestException('Assigned supervisor must be active');
    }

    const user = await this.prisma.user.update({
      where: { id: agent.id },
      data: { supervisorId: supervisor.id },
      select: {
        ...this.safeUserSelect,
        supervisor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await this.activityService.logActivity({
      action: ActivityLogAction.USER_ASSIGNED_TO_SUPERVISOR,
      entityType: ActivityEntityType.USER,
      entityId: user.id,
      actorId: actorId ?? null,
      userId: user.id,
      metadata: {
        supervisorId: supervisor.id,
      },
    });

    return user;
  }

  async updateUser(userId: string, dto: UpdateUserDto, actorId: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: this.safeUserSelect,
    });

    if (!existingUser) {
      throw new NotFoundException('User does not exist');
    }

    if (
      actorId === userId &&
      dto.role !== undefined &&
      dto.role !== existingUser.role
    ) {
      throw new BadRequestException('You cannot change your own role');
    }

    const normalizedName = this.normalizeOptionalString(dto.name);
    const normalizedEmail = this.normalizeOptionalString(dto.email);
    const normalizedPhone = this.normalizeOptionalString(dto.phone);
    const normalizedSupervisorId = this.normalizeOptionalString(
      dto.supervisorId,
    );
    const nextRole = dto.role ?? existingUser.role;

    if (normalizedName === null) {
      throw new BadRequestException('Name cannot be empty');
    }

    if (normalizedEmail === null) {
      throw new BadRequestException('Email cannot be empty');
    }

    if (normalizedSupervisorId === userId) {
      throw new BadRequestException('User cannot supervise themselves');
    }

    const nextEmail =
      normalizedEmail !== undefined
        ? normalizedEmail.toLowerCase()
        : existingUser.email;
    const isEmailChanging = nextEmail !== existingUser.email;

    if (nextEmail !== existingUser.email) {
      const duplicateUser = await this.findByEmail(nextEmail);

      if (duplicateUser && duplicateUser.id !== userId) {
        throw new ConflictException('User with this email already exists');
      }
    }

    let validatedSupervisorId: string | null | undefined =
      normalizedSupervisorId;

    if (nextRole !== UserRole.AGENT) {
      validatedSupervisorId = null;
    } else if (validatedSupervisorId !== undefined && validatedSupervisorId) {
      const supervisor = await this.prisma.user.findUnique({
        where: { id: validatedSupervisorId },
        select: {
          id: true,
          role: true,
          status: true,
        },
      });

      if (!supervisor) {
        throw new NotFoundException('Supervisor does not exist');
      }

      if (supervisor.role !== UserRole.SUPERVISOR) {
        throw new BadRequestException(
          'Assigned supervisor must have SUPERVISOR role',
        );
      }

      if (supervisor.status !== UserStatus.ACTIVE) {
        throw new BadRequestException('Assigned supervisor must be active');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(normalizedName !== undefined ? { name: normalizedName } : {}),
        ...(normalizedEmail !== undefined ? { email: nextEmail } : {}),
        ...(normalizedPhone !== undefined ? { phone: normalizedPhone } : {}),
        ...(dto.role !== undefined ? { role: dto.role } : {}),
        ...(isEmailChanging
          ? { emailVerified: false }
          : dto.emailVerified !== undefined
            ? { emailVerified: dto.emailVerified }
            : {}),
        ...(validatedSupervisorId !== undefined
          ? { supervisorId: validatedSupervisorId }
          : {}),
      },
      select: this.safeUserSelect,
    });

    if (isEmailChanging) {
      await this.emailVerificationService.sendVerificationEmail(
        updatedUser.id,
        {
          actorId,
          reason: 'email_changed_by_moderator',
        },
      );
    }

    if (
      validatedSupervisorId !== undefined &&
      validatedSupervisorId !== existingUser.supervisorId
    ) {
      await this.activityService.logActivity({
        action: ActivityLogAction.USER_ASSIGNED_TO_SUPERVISOR,
        entityType: ActivityEntityType.USER,
        entityId: updatedUser.id,
        actorId,
        userId: updatedUser.id,
        metadata: {
          previousSupervisorId: existingUser.supervisorId,
          supervisorId: updatedUser.supervisorId,
        },
      });
    }

    return updatedUser;
  }

  async updateOwnProfile(
    userId: string,
    dto: {
      name?: string | null;
      email?: string | null;
      phone?: string | null;
    },
  ) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: this.safeUserSelect,
    });

    if (!existingUser) {
      throw new NotFoundException('User does not exist');
    }

    const normalizedName = this.normalizeOptionalString(dto.name);
    const normalizedEmail = this.normalizeOptionalString(dto.email);
    const normalizedPhone = this.normalizeOptionalString(dto.phone);

    if (
      normalizedName === undefined &&
      normalizedEmail === undefined &&
      normalizedPhone === undefined
    ) {
      throw new BadRequestException('No fields were provided for update');
    }

    if (normalizedName === null) {
      throw new BadRequestException('Name cannot be empty');
    }

    if (normalizedEmail === null) {
      throw new BadRequestException('Email cannot be empty');
    }

    const nextEmail =
      normalizedEmail !== undefined
        ? normalizedEmail.toLowerCase()
        : existingUser.email;
    const isEmailChanging = nextEmail !== existingUser.email;

    if (nextEmail !== existingUser.email) {
      const duplicateUser = await this.findByEmail(nextEmail);

      if (duplicateUser && duplicateUser.id !== userId) {
        throw new ConflictException('User with this email already exists');
      }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(normalizedName !== undefined ? { name: normalizedName } : {}),
        ...(normalizedEmail !== undefined ? { email: nextEmail } : {}),
        ...(normalizedPhone !== undefined ? { phone: normalizedPhone } : {}),
        ...(isEmailChanging ? { emailVerified: false } : {}),
      },
      select: this.safeUserSelect,
    });
  }

  async resendUserVerificationEmail(userId: string, actorId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: this.safeUserSelect,
    });

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    if (user.emailVerified) {
      throw new BadRequestException('User email is already verified');
    }

    return this.emailVerificationService.sendVerificationEmail(user.id, {
      actorId,
      reason: 'moderator_resend',
    });
  }

  async updateUserStatus(userId: string, status: UserStatus, actorId: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: this.safeUserSelect,
    });

    if (!existingUser) {
      throw new NotFoundException('User does not exist');
    }

    if (actorId === userId && status === UserStatus.INACTIVE) {
      throw new BadRequestException('You cannot deactivate your own account');
    }

    if (existingUser.status === status) {
      return existingUser;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        status,
      },
      select: this.safeUserSelect,
    });

    await this.activityService.logActivity({
      action: ActivityLogAction.USER_STATUS_CHANGED,
      entityType: ActivityEntityType.USER,
      entityId: updatedUser.id,
      actorId,
      userId: updatedUser.id,
      metadata: {
        previousStatus: existingUser.status,
        status: updatedUser.status,
      },
    });

    return updatedUser;
  }

  async resetUserPassword(userId: string, actorId: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!existingUser) {
      throw new NotFoundException('User does not exist');
    }

    const defaultPassword = this.generateUserDefaultPassword();
    const hashedPassword = await this.hashPassword(defaultPassword);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        passwordUpdatedAt: new Date(),
        mustChangePassword: true,
      },
    });

    await this.activityService.logActivity({
      action: ActivityLogAction.USER_PASSWORD_RESET,
      entityType: ActivityEntityType.USER,
      entityId: existingUser.id,
      actorId,
      userId: existingUser.id,
      metadata: {
        email: existingUser.email,
      },
    });

    await this.mailService.sendPasswordResetNotification({
      receiverEmail: existingUser.email,
      htmlProps: {
        firstName: existingUser.name,
        temporaryPassword: defaultPassword,
      },
    });

    return {
      userId,
    };
  }

  async updatePasswordHash(userId: string, password: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password,
        passwordUpdatedAt: new Date(),
        mustChangePassword: false,
      },
    });
  }

  async getUsersByRoleScope(requesterId: string) {
    const requester = await this.prisma.user.findUnique({
      where: { id: requesterId },
      select: {
        id: true,
        role: true,
        supervisorId: true,
      },
    });

    if (!requester) {
      throw new NotFoundException('User does not exist');
    }

    if (requester.role === UserRole.MODERATOR) {
      return this.getAllUsers();
    }

    if (requester.role === UserRole.SUPERVISOR) {
      const users = await this.prisma.user.findMany({
        where: {
          supervisorId: requester.id,
        },
        select: this.safeUserSelect,
      });

      return {
        total: users.length,
        users,
      };
    }

    if (requester.role === UserRole.AGENT) {
      if (!requester.supervisorId) {
        return {
          total: 0,
          users: [],
        };
      }

      const supervisor = await this.prisma.user.findUnique({
        where: { id: requester.supervisorId },
        select: this.safeUserSelect,
      });

      return {
        total: supervisor ? 1 : 0,
        users: supervisor ? [supervisor] : [],
      };
    }

    throw new ForbiddenException('Unsupported user role');
  }

  async getUserDetailByRoleScope(requesterId: string, targetUserId: string) {
    const requester = await this.prisma.user.findUnique({
      where: { id: requesterId },
      select: {
        id: true,
        role: true,
        supervisorId: true,
      },
    });

    if (!requester) {
      throw new NotFoundException('User does not exist');
    }

    if (requester.role === UserRole.MODERATOR) {
      return this.findPublicById(targetUserId);
    }

    if (requester.role === UserRole.AGENT) {
      if (requester.supervisorId !== targetUserId) {
        throw new ForbiddenException(
          'Agents can only view their assigned supervisor',
        );
      }

      const supervisor = await this.prisma.user.findFirst({
        where: {
          id: targetUserId,
          role: UserRole.SUPERVISOR,
        },
        select: this.safeUserSelect,
      });

      if (!supervisor) {
        throw new NotFoundException('Supervisor does not exist');
      }

      return supervisor;
    }

    if (requester.role === UserRole.SUPERVISOR) {
      const agent = await this.prisma.user.findFirst({
        where: {
          id: targetUserId,
          supervisorId: requester.id,
        },
        select: this.safeUserSelect,
      });

      if (!agent) {
        throw new ForbiddenException(
          'Supervisors can only view their assigned agents',
        );
      }

      return agent;
    }

    throw new ForbiddenException('Unsupported user role');
  }
}
