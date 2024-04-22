import Redis from 'ioredis';
import { getCacheTTL } from 'api/utils/cosmos';

export interface ICache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
}

export class SimpleCache implements ICache {
  private static instance: SimpleCache;
  private redis: Redis;

  private constructor() {
    const port = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379;
    const host = process.env.REDIS_HOST || 'localhost';
    this.redis = new Redis(port, host);
  }

  public static getInstance(): SimpleCache {
    if (!SimpleCache.instance) {
      SimpleCache.instance = new SimpleCache();
    }
    return SimpleCache.instance;
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) as T : null;
  }

  async set<T>(key: string, value: T, ttl: number = getCacheTTL()): Promise<void> {
    const stringValue = JSON.stringify(value, (_key, val) =>
      typeof val === 'bigint' ? val.toString() : val // Convert BigInt to string
    );
    // if ttl is set to -1 then the key should never expire
    if (ttl === -1) {
      await this.redis.set(key, stringValue);
    } else {
      await this.redis.set(key, stringValue, 'EX', ttl);
    }
  }
}
