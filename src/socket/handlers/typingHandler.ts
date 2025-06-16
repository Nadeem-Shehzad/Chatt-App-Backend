import { Server, Socket } from 'socket.io';
import { pubClient } from '../../config/redisPubSub';

export const typingHandler = (socket: Socket, io: Server) => {
  socket.on('userTyping', async ({ toUserId, typing }: { toUserId: string, typing: boolean }) => {
    const payload = JSON.stringify({
      fromUserId: socket.data.userId,
      toUserId,
      typing
    });

    await pubClient.publish('typing_channel', payload);
  });
};