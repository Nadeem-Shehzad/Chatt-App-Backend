import { Server } from 'socket.io';
import { socketAuth } from '../middlewares/socketAuth';

const userSocketMap = new Map<string, string>(); // userId -> socket.id

const setupSocket = (io: Server): void => {

   io.use(socketAuth);

   io.on('connection', (socket) => {
      const userId = (socket as any).userId;

      console.log(`Authenticated user ${userId} connected with socket ${socket.id}`);
      userSocketMap.set(userId, socket.id);

      socket.on('disconnect', () => {
         console.log(`User --> ${socket.id} disconnected.`);
         for (const [userId, socketId] of userSocketMap.entries()) {
            if (socketId === socket.id) {
               userSocketMap.delete(userId);
               break;
            }
         }
      });
   });
};

export { userSocketMap };
export default setupSocket;