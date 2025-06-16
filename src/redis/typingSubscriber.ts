// src/redis/typingSubscriber.ts
import { subClient } from '../config/redisPubSub';
import { getSocketInstance } from '../utils/socketInstance';

export const subscribeToTypingEvents = async () => {
  await subClient.subscribe('typing_channel', (message) => {
    try {
      const { fromUserId, toUserId, typing } = JSON.parse(message);
      const io = getSocketInstance();
      io.to(toUserId).emit('typing', { fromUserId, typing });
    } catch (err) {
      console.error('❌ Error handling typing pub/sub message:', err);
    }
  });

  console.log('📨 Subscribed to typing_channel');
};
