// utils/rateLimiter.ts
import { redisClient } from '../config/redis';

interface RateLimitOptions {
  key: string;            // custom key per user/ip+operation
  limit: number;          // allowed attempts
  windowInSeconds: number // time window
}

export const rateLimiter = async ({ key, limit, windowInSeconds }: RateLimitOptions): Promise<{ allowed: boolean; remaining: number }> => {
  const now = Date.now();
  const redisKey = `rate-limit:${key}`;

  const current = await redisClient.get(redisKey);
  if (current) {
    const count = parseInt(current);
    if (count >= limit) {
      return { allowed: false, remaining: 0 };
    }
  }

  const tx = redisClient.multi(); 
  tx.incr(redisKey);
  tx.expire(redisKey, windowInSeconds);
  await tx.exec();

  const remaining = limit - (parseInt(current ?? '0') + 1);

  return { allowed: true, remaining };
};
