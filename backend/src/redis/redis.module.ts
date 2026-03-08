import { Module, Global, Logger } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import KeyvRedis from '@keyv/redis';
import { Keyv } from 'keyv';
import { RedisService } from './redis.service';

const redisLogger = new Logger('RedisCacheModule');

const formatRedisUrlForLogs = (redisUrl: string): string => {
  try {
    const parsedRedisUrl = new URL(redisUrl);
    if (parsedRedisUrl.password) {
      parsedRedisUrl.password = '***';
    }

    return parsedRedisUrl.toString();
  } catch {
    return redisUrl;
  }
};

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>(
          'redis.url',
          'redis://localhost:6379',
        );
        const sessionExpiry = configService.get<number>(
          'session.expiry',
          604800,
        );
        const sanitizedRedisUrl = formatRedisUrlForLogs(redisUrl);

        const keyvRedis = new KeyvRedis(redisUrl);
        const redisClient = keyvRedis.client;

        redisClient.on('connect', () => {
          redisLogger.log(`Redis client connecting: ${sanitizedRedisUrl}`);
        });

        redisClient.on('ready', () => {
          redisLogger.log(`Redis connection ready: ${sanitizedRedisUrl}`);
        });

        redisClient.on('reconnecting', () => {
          redisLogger.warn(`Redis client reconnecting: ${sanitizedRedisUrl}`);
        });

        redisClient.on('end', () => {
          redisLogger.warn(`Redis connection ended: ${sanitizedRedisUrl}`);
        });

        redisClient.on('error', (error: unknown) => {
          redisLogger.error(
            `Redis client error: ${error instanceof Error ? error.message : String(error)}`,
          );
        });

        try {
          const connectedClient = await keyvRedis.getClient();
          const isClientReady =
            ('isReady' in connectedClient &&
              Boolean(connectedClient.isReady)) ||
            ('isOpen' in connectedClient && Boolean(connectedClient.isOpen));

          if (isClientReady) {
            redisLogger.log(`Redis connected: ${sanitizedRedisUrl}`);
          } else {
            redisLogger.warn(
              `Redis client initialized but not ready: ${sanitizedRedisUrl}`,
            );
          }
        } catch (error) {
          redisLogger.error(
            `Redis connection check failed: ${error instanceof Error ? error.message : String(error)}`,
          );
        }

        return {
          stores: [new Keyv({ store: keyvRedis })],
          ttl: sessionExpiry * 1000,
          max: 1000, // Maximum number of items in cache
        };
      },
    }),
  ],
  providers: [RedisService],
  exports: [CacheModule, RedisService],
})
export class RedisModule {}
