import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { AssignSupportStaffDto } from './dto/assign-support-staff.dto';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { User } from 'src/generated/prisma/client';
import {
  // ActivityEntityType,
  // ActivityLogAction,
  UserRole,
} from 'src/generated/prisma/enums';
import { PrismaService } from 'src/prisma.service';
import { SafeUser } from 'src/auth/types/user.types';
// import { ActivityService } from 'src/activity/activity.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    // private readonly activityService: ActivityService,
  ) {}

  private readonly safeUserSelect = {
    id: true,
    name: true,
    email: true,
    role: true,
    phone: true,
    status: true,
    emailVerified: true,
    createdAt: true,
    updatedAt: true,
  } as const;

  private getRandomCharacter(charset: string) {
    return charset[randomInt(0, charset.length)];
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
    const tempPassword = 'P@ssw0rd'; // For testing purposes, replace with defaultPassword in production

    const hashedPassword = await bcrypt.hash(tempPassword, 10);

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

    // await this.activityService.logActivity({
    //   action: ActivityLogAction.USER_CREATED,
    //   entityType: ActivityEntityType.USER,
    //   entityId: user.id,
    //   actorId: actorId ?? null,
    //   userId: user.id,
    //   metadata: {
    //     role: user.role,
    //     email: user.email,
    //   },
    // });

    return {
      user,
      defaultPassword,
    };
  }

  async assignSupportStaffToSupervisor(
    dto: AssignSupportStaffDto,
    actorId?: string,
  ) {
    if (dto.supportStaffId === dto.supervisorId) {
      throw new BadRequestException(
        'Support staff and supervisor cannot be the same user',
      );
    }

    const [supportStaff, supervisor] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: dto.supportStaffId },
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
        },
      }),
    ]);

    if (!supportStaff) {
      throw new NotFoundException('Support staff does not exist');
    }

    if (!supervisor) {
      throw new NotFoundException('Supervisor does not exist');
    }

    if (supportStaff.role !== UserRole.SUPPORT_STAFF) {
      throw new BadRequestException('User to assign must be a support staff');
    }

    if (supervisor.role !== UserRole.SUPERVISOR) {
      throw new BadRequestException(
        'Assigned supervisor must have SUPERVISOR role',
      );
    }

    const user = await this.prisma.user.update({
      where: { id: supportStaff.id },
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

    // await this.activityService.logActivity({
    //   action: ActivityLogAction.USER_ASSIGNED_TO_SUPERVISOR,
    //   entityType: ActivityEntityType.USER,
    //   entityId: user.id,
    //   actorId: actorId ?? null,
    //   userId: user.id,
    //   metadata: {
    //     supervisorId: supervisor.id,
    //   },
    // });

    return user;
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

    if (requester.role === UserRole.SUPPORT_STAFF) {
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

    if (requester.role === UserRole.SUPPORT_STAFF) {
      if (requester.supervisorId !== targetUserId) {
        throw new ForbiddenException(
          'Support staff can only view their assigned supervisor',
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
      const supportStaff = await this.prisma.user.findFirst({
        where: {
          id: targetUserId,
          supervisorId: requester.id,
        },
        select: this.safeUserSelect,
      });

      if (!supportStaff) {
        throw new ForbiddenException(
          'Supervisors can only view their assigned support staff',
        );
      }

      return supportStaff;
    }

    throw new ForbiddenException('Unsupported user role');
  }
}
