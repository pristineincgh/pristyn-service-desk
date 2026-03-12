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
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

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
  @Patch(':id/assign-supervisor')
  async assignAgentToSupervisor(
    @Param('id') id: string,
    @Body() dto: AssignAgentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const agent = await this.usersService.assignAgentToSupervisor(
      id,
      dto,
      user.id,
    );

    return {
      message: 'Agent assigned to supervisor successfully.',
      user: agent,
    };
  }

  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR)
  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const updatedUser = await this.usersService.updateUser(id, dto, user.id);

    return {
      message: 'User updated successfully.',
      user: updatedUser,
    };
  }

  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR)
  @Patch(':id/status')
  async updateUserStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const updatedUser = await this.usersService.updateUserStatus(
      id,
      dto.status,
      user.id,
    );

    return {
      message: 'User status updated successfully.',
      user: updatedUser,
    };
  }

  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR)
  @Post(':id/reset-password')
  async resetUserPassword(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const result = await this.usersService.resetUserPassword(id, user.id);

    return {
      message: 'User password reset successfully.',
      ...result,
    };
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
}
