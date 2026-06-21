import Redis from "ioredis";
import type { Env } from "../env";

let redis: Redis | null = null;

export function createRedis(env: Env): Redis {
  if (redis) return redis;

  redis = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => Math.min(times * 200, 2000),
    lazyConnect: true,
  });

  redis.on("error", (err) => {
    console.error("Redis connection error:", err.message);
  });

  return redis;
}

export function getRedis(): Redis {
  if (!redis) throw new Error("Redis not initialized. Call createRedis() first.");
  return redis;
}
