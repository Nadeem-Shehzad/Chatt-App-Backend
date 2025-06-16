import { createClient } from "redis";

const redisClient = createClient({
   url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`
});

redisClient.on('error', (err) => {
   console.error('❌ Redis connection error:', err);
});

export async function connectRedis() {
   if (!redisClient.isOpen) {
      try {
         await redisClient.connect();
         console.log('✅ Redis connected successfully');
      } catch (error) {
         console.error('❌ Redis failed to connect:', error);
      }
   }
} 

export { redisClient };