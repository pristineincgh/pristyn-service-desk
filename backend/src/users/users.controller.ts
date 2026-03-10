import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SessionAuthGuard } from 'src/auth/guards/session-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/generated/prisma/enums';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/auth/types/user.types';
import { AssignAgentDto } from './dto/assign-agent.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR)
  @Get('all')
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @UseGuards(SessionAuthGuard)
  @Get('active')
  async getActiveUsers() {
    return this.usersService.getAllActiveUsers();
  }

  @UseGuards(SessionAuthGuard)
  @Get('scope')
  async getUsersByScope(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getUsersByRoleScope(user.id);
  }

  @UseGuards(SessionAuthGuard)
  @Get('scope/:id')
  async getUserDetailByScope(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return await this.usersService.getUserDetailByRoleScope(user.id, id);
  }

  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR)
  @Get('inactive')
  async getInactiveUsers() {
    return this.usersService.getAllInActiveUsers();
  }

  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR)
  @Post('create-user')
  async createUser(
    @Body() body: CreateUserDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const createResult = await this.usersService.createUser(body, user.id);

    return {
      message: 'User created successfully.',
      user: createResult.user,
      defaultPassword: createResult.defaultPassword,
    };
  }

  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR)
  @Patch('assign-supervisor')
  async assignAgentToSupervisor(
    @Body() dto: AssignAgentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const agent = await this.usersService.assignAgentToSupervisor(
      dto,
      user.id,
    );

    return {
      message: 'Agent assigned to supervisor successfully.',
      user: agent,
    };
  }
}
