import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from './generated/prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private configService: ConfigService) {
    const databaseUrl = configService.get<string>('DATABASE_URL');

    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }

    const adapter = new PrismaNeon({
      connectionString: databaseUrl,
    });

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
