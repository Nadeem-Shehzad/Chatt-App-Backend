import { Server } from 'socket.io';
import { socketAuth } from '../middlewares/socketAuth';
import OnlineUser from '../models/onlineUser';
import { broadcastOnlineUsers, getUnreadMessageSummary, handleUndeliveredMessages } from '../utils/utils';
import Group from '../models/group';
import User from '../models/user';


const userSocketMap = new Map<string, string>(); // userId -> socket.id

const setupSocket = (io: Server): void => {

  io.use(socketAuth);

  io.on('connection', async (socket) => {
    const userId = (socket as any).userId;

    if (!userId) {
      socket.disconnect();
      return;
    }

    //console.log(`Authenticated user ${userId} connected with socket ${socket.id}`);
    userSocketMap.set(userId, socket.id);

    // store in DB
    await OnlineUser.findOneAndUpdate(
      { userId },
      { socketId: socket.id, connectedAt: new Date() },
      { upsert: true, new: true }
    );

    // check user joined groups and then auto join rooms
    const joinedGroups = await Group.find({ members: { $in: [userId] } }).select('_id');
    if (joinedGroups.length > 0) {
      joinedGroups.forEach((group) => {
        const roomId = (group._id as any).toString();
        socket.join(roomId);
        console.log(`User ${socket.id} joined group room ${roomId}`);
      });
    }

    broadcastOnlineUsers(io, userSocketMap, userId);

    await handleUndeliveredMessages(userId, socket);

    const unreadSummary = await getUnreadMessageSummary(userId);
    socket.emit("unreadMessagesSummary", unreadSummary);


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
      await OnlineUser.findOneAndDelete({ socketId: socket.id });
      broadcastOnlineUsers(io, userSocketMap, userId);
    });
  });
};

export { userSocketMap };
export default setupSocket;