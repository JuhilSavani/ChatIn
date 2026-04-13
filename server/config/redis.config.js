import Redis from "ioredis";

let redisClient = null;

export const connectRedis = () => {
  if (redisClient) return redisClient;

  redisClient = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    // Required for Upstash (rediss:// TLS URL)
    tls: process.env.REDIS_URL?.startsWith("rediss://") ? {} : undefined,
    lazyConnect: false,
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => Math.min(times * 100, 3000), // exponential back-off cap 3s
  });

  redisClient.on("connect", async () => {
    process.stdout.write("[REDIS] Connected\n");
    // Clear stale keys on startup
    const staleKeys = await redisClient.keys("user:*");
    if (staleKeys.length) {
      await redisClient.del(...staleKeys);
      process.stdout.write(`[REDIS] Cleared ${staleKeys.length} stale presence keys\n`);
    }
  });

  redisClient.on("error", (err) =>
    console.error("[REDIS] Error:", err.message)
  );

  return redisClient;
};

export const getRedis = () => {
  if (!redisClient) throw new Error("[REDIS] Client not initialized. Call connectRedis() first.");
  return redisClient;
};
