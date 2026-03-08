import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
    } catch (error) {
      this.logger.error(
        `Failed to set key ${key}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async get<T>(key: string): Promise<T | undefined> {
    try {
      return await this.cacheManager.get<T>(key);
    } catch (error) {
      this.logger.error(
        `Failed to get key ${key}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error) {
      this.logger.error(
        `Failed to delete key ${key}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async reset(): Promise<void> {
    try {
      await this.cacheManager.clear();
    } catch (error) {
      this.logger.error(
        `Failed to reset cache: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async wrap<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
    try {
      return await this.cacheManager.wrap(key, fn, ttl);
    } catch (error) {
      this.logger.error(
        `Failed to wrap key ${key}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
