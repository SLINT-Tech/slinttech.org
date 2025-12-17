import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL;

// Parse Redis URL for connection options
const parseRedisUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port) || 6379,
      password: parsed.password || undefined,
      username: parsed.username || undefined,
      tls: parsed.protocol === "rediss:" ? {} : undefined,
    };
  } catch {
    return {
      host: "localhost",
      port: 6379,
    };
  }
};

// Connection for BullMQ (used by both queue and worker)
export const createRedisConnection = () => {
  if (!REDIS_URL) {
    throw new Error("REDIS_URL is not configured");
  }

  const redisOptions = parseRedisUrl(REDIS_URL);

  const connection = new Redis({
    ...redisOptions,
    maxRetriesPerRequest: null, // Required for BullMQ
    enableReadyCheck: false,
    connectTimeout: 5000, // 5 second connection timeout
    lazyConnect: true, // Don't connect immediately
  });

  // Handle connection errors silently
  connection.on("error", (err) => {
    console.error("[REDIS] Connection error:", err.message);
  });

  // Initiate connection
  connection.connect().catch((err) => {
    console.error("[REDIS] Failed to connect:", err.message);
  });

  return connection;
};

// Standard Redis client for other uses (lazy initialization)
let redis: Redis | null = null;

export const getRedis = (): Redis | null => {
  if (!REDIS_URL) {
    return null;
  }

  if (!redis) {
    const redisOptions = parseRedisUrl(REDIS_URL);
    redis = new Redis({
      ...redisOptions,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) {
          return null; // Stop retrying after 3 attempts
        }
        return Math.min(times * 100, 3000);
      },
      connectTimeout: 5000,
      lazyConnect: true,
    });

    redis.on("error", (err) => {
      console.error("[REDIS] Client error:", err.message);
    });

    redis.on("connect", () => {
      console.log("[REDIS] ✅ Connected");
    });

    redis.connect().catch((err) => {
      console.warn("[REDIS] Connection failed:", err.message);
    });
  }

  return redis;
};

export { redis };
export default redis;
