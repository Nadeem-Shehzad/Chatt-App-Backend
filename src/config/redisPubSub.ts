import { createClient } from 'redis';

export const pubClient = createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
});

export const subClient = pubClient.duplicate();

export const connectRedisPubSub = async () => {
  try {
    await pubClient.connect(); 
    await subClient.connect();
    console.log('✅ Redis Pub/Sub connected');
  } catch (err) {
    console.error('❌ Redis Pub/Sub connection failed:', err); 
  }
};