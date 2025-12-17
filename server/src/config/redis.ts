import Redis, { RedisOptions } from "ioredis";

const REDIS_URL = process.env.REDIS_URL;

/**
 * Parse Redis URL for connection options
 * Supports Azure Managed Redis connection strings:
 * - rediss://:PASSWORD@HOST:PORT (TLS enabled)
 * - redis://:PASSWORD@HOST:PORT (non-TLS)
 * - HOST:PORT,password=PASSWORD,ssl=True (Azure format)
 */
const parseRedisUrl = (url: string): RedisOptions => {
  // Handle Azure Redis connection string format: hostname:port,password=xxx,ssl=True
  if (url.includes(",password=")) {
    const parts = url.split(",");
    const hostPort = parts[0].split(":");
    const password = parts
      .find((p) => p.startsWith("password="))
      ?.replace("password=", "");
    const useSsl = parts.some(
      (p) => p.toLowerCase() === "ssl=true" || p.toLowerCase() === "ssl=on"
    );

    return {
      host: hostPort[0],
      port: parseInt(hostPort[1]) || 6380,
      password: password,
      tls: useSsl
        ? {
            servername: hostPort[0], // Required for Azure Redis TLS
          }
        : undefined,
    };
  }

  // Handle standard Redis URL format: redis[s]://[:password@]host:port
  try {
    const parsed = new URL(url);
    const useTls = parsed.protocol === "rediss:";

    return {
      host: parsed.hostname,
      port: parseInt(parsed.port) || (useTls ? 6380 : 6379),
      password: parsed.password || undefined,
      username: parsed.username || undefined,
      tls: useTls
        ? {
            servername: parsed.hostname, // Required for Azure Redis TLS
          }
        : undefined,
    };
  } catch {
    console.warn("[REDIS] Could not parse URL, using defaults");
    return {
      host: "localhost",
      port: 6379,
    };
  }
};

/**
 * Create Redis connection for BullMQ (used by both queue and worker)
 * Azure Managed Redis requirements:
 * - TLS enabled by default (port 6380)
 * - Password authentication required
 */
export const createRedisConnection = () => {
  if (!REDIS_URL) {
    throw new Error("REDIS_URL is not configured");
  }

  const redisOptions = parseRedisUrl(REDIS_URL);

  console.log("[REDIS] Connecting to:", redisOptions.host);

  const connection = new Redis({
    ...redisOptions,
    maxRetriesPerRequest: null, // Required for BullMQ
    enableReadyCheck: false,
    connectTimeout: 10000, // 10 second timeout for Azure
    lazyConnect: true,
    // Azure Redis specific settings
    keepAlive: 30000, // Keep connection alive
    family: 4, // Use IPv4
  });

  // Handle connection events
  connection.on("error", (err) => {
    console.error("[REDIS] Connection error:", err.message);
  });

  connection.on("connect", () => {
    console.log("[REDIS] ✅ Connected to Azure Managed Redis");
  });

  connection.on("ready", () => {
    console.log("[REDIS] ✅ Ready to accept commands");
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
        if (times > 5) {
          console.error("[REDIS] Max retries reached, giving up");
          return null;
        }
        const delay = Math.min(times * 500, 5000);
        console.log(`[REDIS] Retrying connection in ${delay}ms...`);
        return delay;
      },
      connectTimeout: 10000,
      lazyConnect: true,
      keepAlive: 30000,
      family: 4,
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
