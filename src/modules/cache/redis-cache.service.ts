import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnModuleDestroy,
} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisCacheService implements OnModuleDestroy {
  private readonly client: Redis;

  constructor(configService: ConfigService) {
    const redisUrl = configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
    this.client = new Redis(redisUrl);
  }

  key(somiteeId: number, suffix: string) {
    return `somitee:${somiteeId}:${suffix}`;
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    return value ? (JSON.parse(value) as T) : null;
  }

  async set(key: string, value: any, ttlSeconds = 300): Promise<void> {
    await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async flushAll(): Promise<void> {
    await this.client.flushall();
  }

  async onModuleDestroy() {
    try {
      await this.client.quit();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('redis-cache.service.service.onModuleDestroy error:', {
          message: error.message,
          stack: error.stack,
        });
      } else {
        console.error('redis-cache.service.service.onModuleDestroy unknown error:', error);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to onModuleDestroy');
    }
  }
}
