import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Parse Redis URL for connection options
const parseRedisUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port) || 6379,
      password: parsed.password || undefined,
      username: parsed.username || undefined,
      tls: parsed.protocol === 'rediss:' ? {} : undefined,
    };
  } catch {
    return {
      host: 'localhost',
      port: 6379,
    };
  }
};

const redisOptions = parseRedisUrl(REDIS_URL);

// Connection for BullMQ (used by both queue and worker)
export const createRedisConnection = () => {
  return new Redis({
    ...redisOptions,
    maxRetriesPerRequest: null, // Required for BullMQ
    enableReadyCheck: false,
  });
};

// Standard Redis client for other uses
export const redis = new Redis({
  ...redisOptions,
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 100, 3000),
});

redis.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redis.on('connect', () => {
  console.log('✅ Connected to Redis');
});

export default redis;

