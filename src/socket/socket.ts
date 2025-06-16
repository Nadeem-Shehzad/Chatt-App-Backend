import { Server } from 'socket.io';
import { socketAuth } from '../middlewares/socketAuth';
import OnlineUser from '../models/onlineUser';
import { broadcastOnlineUsers, getUnreadMessageSummary, handleUndeliveredMessages } from '../utils/utils';
import Group from '../models/group';
import User from '../models/user';

import { typingHandler } from './handlers/typingHandler';
import { subClient } from '../config/redisPubSub';
import { broadcastOnlineStatus, getOnlineUsers, initOnlineUserHandler } from './handlers/onlineUserHandlers';


const userSocketMap = new Map<string, string>(); // userId -> socket.id

const setupSocket = (io: Server): void => {

  initOnlineUserHandler(io);
  io.use(socketAuth);

  io.on('connection', async (socket) => {
    const userId = (socket as any).userId;

    if (!userId) {
      socket.disconnect();
      return;
    }

    //console.log(`Authenticated user ${userId} connected with socket ${socket.id}`);
    //userSocketMap.set(userId, socket.id);
    socket.join(userId);
    broadcastOnlineStatus('online', userId, socket.id);

    // store in DB
    // await OnlineUser.findOneAndUpdate(
    //   { userId },
    //   { socketId: socket.id, connectedAt: new Date() },
    //   { upsert: true, new: true }
    // );

    // check user joined groups and then auto join rooms
    const joinedGroups = await Group.find({ members: { $in: [userId] } }).select('_id');
    if (joinedGroups.length > 0) {
      joinedGroups.forEach((group) => {
        const roomId = (group._id as any).toString();
        socket.join(roomId);
        console.log(`User ${socket.id} joined group room ${roomId}`);
      });
    }

    //broadcastOnlineUsers(io, userSocketMap, userId);

    await handleUndeliveredMessages(userId, socket);

    const unreadSummary = await getUnreadMessageSummary(userId);
    socket.emit("unreadMessagesSummary", unreadSummary);

    // Typing indicator via Redis Pub/Sub
    typingHandler(socket, io);
    socket.emit('onlineUsers', getOnlineUsers().filter(id => id !== userId));

    socket.on('disconnect', async () => {
      console.log(`User --> ${socket.id} disconnected.`);
      for (const [userId, socketId] of userSocketMap.entries()) {
        if (socketId === socket.id) {
          userSocketMap.delete(userId);
          break;
        }
      }

      await User.findByIdAndUpdate(
        userId,
        {
          $set: { lastSeen: new Date() } 
        }, { new: true }
      );

      // remove from DB
      // await OnlineUser.findOneAndDelete({ socketId: socket.id });
      // broadcastOnlineUsers(io, userSocketMap, userId);
    });
  });

  // 👉 Redis Subscriber listens and emits typing to target user socket
  subClient.subscribe('typing_channel', (message) => {
    const { toUserId, fromUserId, typing } = JSON.parse(message);
    const toSocketId = userSocketMap.get(toUserId);
    if (toSocketId) {
      io.to(toSocketId).emit('typing', { fromUserId, typing });
    }
  });
};

export { userSocketMap };
export default setupSocket;