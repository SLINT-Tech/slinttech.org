import Redis, { Cluster, RedisOptions, ClusterOptions } from "ioredis";

const REDIS_URL = process.env.REDIS_URL;

interface ParsedRedisConfig {
  host: string;
  port: number;
  password?: string;
  username?: string;
  tls: boolean;
  isCluster: boolean; // Azure Managed Redis uses cluster mode
}

/**
 * Parse Redis URL for connection options
 * Supports:
 * - Azure Managed Redis (NEW): *.redis.azure.net:10000 (clustered)
 * - Azure Cache for Redis (OLD): *.redis.cache.windows.net:6380 (non-clustered)
 * - Standard Redis URLs: redis[s]://:password@host:port
 * - Azure connection string: host:port,password=xxx,ssl=True
 */
const parseRedisUrl = (url: string): ParsedRedisConfig => {
  // Handle Azure Redis connection string format: hostname:port,password=xxx,ssl=True
  if (url.includes(",password=") || url.includes(",ssl=")) {
    const parts = url.split(",");
    const hostPort = parts[0].split(":");
    const host = hostPort[0];
    const port = parseInt(hostPort[1]) || 6380;
    const password = parts
      .find((p) => p.startsWith("password="))
      ?.replace("password=", "");
    const useSsl = parts.some(
      (p) => p.toLowerCase() === "ssl=true" || p.toLowerCase() === "ssl=on"
    );

    // Azure Managed Redis uses *.redis.azure.net and port 10000
    const isAzureManagedRedis =
      host.includes(".redis.azure.net") || port === 10000;

    return {
      host,
      port,
      password,
      // For Azure Managed Redis with access keys, use "default" as username
      username: isAzureManagedRedis ? "default" : undefined,
      tls: useSsl,
      isCluster: isAzureManagedRedis,
    };
  }

  // Handle standard Redis URL format: redis[s]://[:password@]host:port
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    const useTls = parsed.protocol === "rediss:";
    const defaultPort = useTls ? 6380 : 6379;
    const port = parseInt(parsed.port) || defaultPort;

    // Azure Managed Redis uses *.redis.azure.net and port 10000
    const isAzureManagedRedis =
      host.includes(".redis.azure.net") || port === 10000;

    // Decode URL-encoded password (Azure keys often have special chars like + = /)
    const password = parsed.password
      ? decodeURIComponent(parsed.password)
      : undefined;

    // For Azure Managed Redis with access keys, use "default" as username
    // This is required for Redis 6+ ACL authentication
    const username = isAzureManagedRedis
      ? "default"
      : parsed.username || undefined;

    return {
      host,
      port,
      password,
      username,
      tls: useTls,
      isCluster: isAzureManagedRedis,
    };
  } catch {
    console.warn("[REDIS] Could not parse URL, using defaults");
    return {
      host: "localhost",
      port: 6379,
      tls: false,
      isCluster: false,
    };
  }
};

/**
 * Create Redis Cluster connection for Azure Managed Redis
 * Azure Managed Redis is always clustered and uses port 10000
 */
const createClusterConnection = (config: ParsedRedisConfig): Cluster => {
  console.log("[REDIS] Creating CLUSTER connection for Azure Managed Redis");

  const clusterOptions: ClusterOptions = {
    redisOptions: {
      password: config.password,
      username: config.username,
      tls: config.tls
        ? {
            servername: config.host,
            rejectUnauthorized: true,
          }
        : undefined,
      connectTimeout: 15000,
      keepAlive: 30000,
      family: 4,
      // BullMQ requirements - must be inside redisOptions for Cluster
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    },
    // Cluster specific settings
    slotsRefreshTimeout: 10000,
    dnsLookup: (
      address: string,
      callback: (err: Error | null, address: string) => void
    ) => callback(null, address),
    natMap: undefined,
    // Don't auto-discover nodes (Azure manages this)
    scaleReads: "master",
    clusterRetryStrategy: (times: number) => {
      if (times > 5) {
        console.error("[REDIS] Cluster max retries reached");
        return null;
      }
      return Math.min(times * 500, 5000);
    },
  };

  const cluster = new Cluster(
    [{ host: config.host, port: config.port }],
    clusterOptions
  );

  cluster.on("error", (err) => {
    console.error("[REDIS] Cluster error:", err.message);
  });

  cluster.on("connect", () => {
    console.log("[REDIS] ✅ Connected to Azure Managed Redis (Cluster)");
  });

  cluster.on("ready", () => {
    console.log("[REDIS] ✅ Cluster ready to accept commands");
  });

  cluster.on("node error", (err, address) => {
    console.error(`[REDIS] Node ${address} error:`, err.message);
  });

  return cluster;
};

/**
 * Create standard Redis connection for Azure Cache for Redis
 */
const createStandardConnection = (config: ParsedRedisConfig): Redis => {
  console.log("[REDIS] Creating STANDARD connection for Azure Cache for Redis");

  const redisOptions: RedisOptions = {
    host: config.host,
    port: config.port,
    password: config.password,
    username: config.username,
    tls: config.tls
      ? {
          servername: config.host,
          rejectUnauthorized: true,
        }
      : undefined,
    maxRetriesPerRequest: null, // Required for BullMQ
    enableReadyCheck: false,
    connectTimeout: 15000,
    lazyConnect: true,
    keepAlive: 30000,
    family: 4,
  };

  const connection = new Redis(redisOptions);

  connection.on("error", (err) => {
    console.error("[REDIS] Connection error:", err.message);
  });

  connection.on("connect", () => {
    console.log("[REDIS] ✅ Connected to Azure Cache for Redis");
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

/**
 * Create Redis connection for BullMQ (used by both queue and worker)
 * Automatically detects Azure Managed Redis vs Azure Cache for Redis
 */
export const createRedisConnection = (): Redis | Cluster => {
  if (!REDIS_URL) {
    throw new Error("REDIS_URL is not configured");
  }

  const config = parseRedisUrl(REDIS_URL);

  // Debug logging (hide password)
  console.log("[REDIS] Connection config:", {
    host: config.host,
    port: config.port,
    tls: config.tls ? "enabled" : "disabled",
    username: config.username || "(none)",
    hasPassword: !!config.password,
    passwordLength: config.password?.length || 0,
    mode: config.isCluster
      ? "CLUSTER (Azure Managed Redis)"
      : "STANDARD (Azure Cache for Redis)",
  });

  if (config.isCluster) {
    return createClusterConnection(config);
  } else {
    return createStandardConnection(config);
  }
};

// Track if we're using cluster mode (needed for queue prefix)
export const isClusterMode = (): boolean => {
  if (!REDIS_URL) return false;
  const config = parseRedisUrl(REDIS_URL);
  return config.isCluster;
};

// Standard Redis client for other uses (lazy initialization)
let redis: Redis | Cluster | null = null;

export const getRedis = (): Redis | Cluster | null => {
  if (!REDIS_URL) {
    return null;
  }

  if (!redis) {
    const config = parseRedisUrl(REDIS_URL);

    if (config.isCluster) {
      redis = createClusterConnection(config);
    } else {
      redis = new Redis({
        host: config.host,
        port: config.port,
        password: config.password,
        username: config.username,
        tls: config.tls
          ? {
              servername: config.host,
              rejectUnauthorized: true,
            }
          : undefined,
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
        connectTimeout: 15000,
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

      (redis as Redis).connect().catch((err) => {
        console.warn("[REDIS] Connection failed:", err.message);
      });
    }
  }

  return redis;
};

export { redis };
export default redis;
