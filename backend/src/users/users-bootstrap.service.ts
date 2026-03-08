import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users.service';

@Injectable()
export class UsersBootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(UsersBootstrapService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const email = this.configService.get<string | undefined>('moderator.email');
    const password = this.configService.get<string | undefined>(
      'moderator.password',
    );
    const name = this.configService.get<string>(
      'moderator.name',
      'System Moderator',
    );

    if (!email || !password) {
      this.logger.log(
        'Skipping moderator bootstrap because MODERATOR_EMAIL or MODERATOR_PASSWORD is not configured.',
      );
      return;
    }

    await this.usersService.ensureModeratorAccount({
      email,
      password,
      name,
    });
  }
}
