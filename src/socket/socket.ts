import { Server } from 'socket.io';
import { socketAuth } from '../middlewares/socketAuth';
import OnlineUser from '../models/onlineUser';
import { broadcastOnlineUsers } from '../utils/utils';

const userSocketMap = new Map<string, string>(); // userId -> socket.id

const setupSocket = (io: Server): void => {

   io.use(socketAuth);

   io.on('connection', async (socket) => {
      const userId = (socket as any).userId;

      console.log(`Authenticated user ${userId} connected with socket ${socket.id}`);
      userSocketMap.set(userId, socket.id);

      // store in DB
      await OnlineUser.findOneAndUpdate(
         { userId },
         { socketId: socket.id, connectedAt: new Date() },
         { upsert: true, new: true }
      );

      broadcastOnlineUsers(io, userSocketMap, userId);

      socket.on('disconnect', async () => {
         console.log(`User --> ${socket.id} disconnected.`);
         for (const [userId, socketId] of userSocketMap.entries()) {
            if (socketId === socket.id) {
               userSocketMap.delete(userId);
               break;
            }
         }

         // remove from DB
         await OnlineUser.findOneAndDelete({ socketId: socket.id });
         broadcastOnlineUsers(io, userSocketMap,userId);
      });
   });
};

export { userSocketMap };
export default setupSocket;