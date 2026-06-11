import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

const memoryStore = new Map();
let upstashRatelimit = null;

function createRedisClient() {
  if (
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return Redis.fromEnv();
  }

  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    return new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });
  }

  return null;
}

function getUpstashRatelimit() {
  if (upstashRatelimit) return upstashRatelimit;

  const redis = createRedisClient();
  if (!redis) return null;

  upstashRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(MAX_REQUESTS, "1 m"),
    prefix: "excuse-generator",
  });
  return upstashRatelimit;
}

function checkMemoryLimit(identifier) {
  const now = Date.now();
  const record = memoryStore.get(identifier) ?? {
    count: 0,
    resetAt: now + WINDOW_MS,
  };

  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + WINDOW_MS;
  }

  record.count += 1;
  memoryStore.set(identifier, record);

  if (memoryStore.size > 10_000) {
    for (const [key, value] of memoryStore) {
      if (now > value.resetAt) memoryStore.delete(key);
    }
  }

  return {
    success: record.count <= MAX_REQUESTS,
    remaining: Math.max(0, MAX_REQUESTS - record.count),
  };
}

export function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers["x-real-ip"];
  if (typeof realIp === "string" && realIp.length > 0) return realIp;
  return "unknown";
}

export async function checkRateLimit(identifier) {
  const ratelimit = getUpstashRatelimit();

  if (ratelimit) {
    const result = await ratelimit.limit(identifier);
    return {
      success: result.success,
      remaining: result.remaining,
    };
  }

  return checkMemoryLimit(identifier);
}
