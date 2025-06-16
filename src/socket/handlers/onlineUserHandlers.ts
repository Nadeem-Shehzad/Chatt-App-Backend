// src/socket/handlers/onlineUserHandler.ts
import { Server } from 'socket.io';
import { pubClient, subClient } from '../../config/redisPubSub';

const onlineUsers = new Map<string, string>(); // userId -> socketId

const ONLINE_CHANNEL = 'online_users';

export const initOnlineUserHandler = (io: Server) => {
  subClient.subscribe(ONLINE_CHANNEL, (message) => {
    const { type, userId, socketId } = JSON.parse(message);
    if (type === 'online') {
      onlineUsers.set(userId, socketId);
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    } else if (type === 'offline') {
      onlineUsers.delete(userId);
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    }
  });
};

export const broadcastOnlineStatus = (type: 'online' | 'offline', userId: string, socketId: string) => {
  const msg = JSON.stringify({ type, userId, socketId });
  pubClient.publish(ONLINE_CHANNEL, msg);
};

export const getOnlineUsers = () => {
  return Array.from(onlineUsers.keys());
};

export const getSocketIdByUserId = (userId: string): string | undefined => {
  return onlineUsers.get(userId);
};
