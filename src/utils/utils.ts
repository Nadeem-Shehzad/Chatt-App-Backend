import Contact from "../models/contact";
import { IContact, IMessageDTO } from "./customTypes";
import { userSocketMap } from "../socket/socket";
import { getSocketInstance } from "./socketInstance";
import { Server } from "socket.io";
import Message from "../models/message";


export const sendNewContactRequest = async ({ senderId, receiverId }: { senderId: string; receiverId: string }) => {

   const newContact = await Contact.create({
      requester: senderId,
      receiver: receiverId,
      status: 'pending'
   });

   const io = getSocketInstance();
   const targetSocketId = userSocketMap.get(receiverId);
   if (targetSocketId) {
      io.to(targetSocketId).emit('contactRequestReceived', {
         contactId: newContact._id,
         from: senderId,
      });
   }

   return {
      success: false,
      message: 'Contact request sent. Please wait for acceptance.',
      data: null,
   };
}


export const checkContactStatus = ({ contact }: { contact: IContact }) => {

   if (contact && contact.status === 'blocked') {
      return {
         success: false,
         message: 'You are blocked or have blocked this user.',
         data: null,
      };
   }

   if (contact && contact.status !== 'accepted') {
      return {
         success: false,
         message: 'Contact request is still pending.',
         data: null,
      };
   }

   return null;
}


export const sendMessageToReceiver = async ({senderId,receiverId,message}: {senderId: string;receiverId: string;message: IMessageDTO;}): Promise<boolean> => {
   
   const io = getSocketInstance();
   const targetSocketId = userSocketMap.get(receiverId);

   if (targetSocketId) {
      const deliveredAt = new Date();

      const messageData = {
         _id: message._id,
         sender: senderId,
         receiver: receiverId,
         content: message.content,
         createdAt: message.createdAt,
         deliveredAt,
      };

      // Emit message to receiver
      io.to(targetSocketId).emit('newMessage', messageData);

      // Update deliveredAt in DB
      await Message.findByIdAndUpdate(message._id, {
         deliveredAt,
      });

      return true;
   }

   return false;
};


export const broadcastOnlineUsers = (io: Server, userSocketMap: Map<string, string>, newUserId: string) => {
   const onlineUserIds = Array.from(userSocketMap.keys());

   // Delay slightly to allow socket setup
   setTimeout(() => {
      const newUserSocketId = userSocketMap.get(newUserId);

      // Send to the new user first
      if (newUserSocketId) {
         const newSocket = io.sockets.sockets.get(newUserSocketId);
         if (newSocket && newSocket.connected) {
            //console.log(`🔔 Sending online list to NEW user ${newUserId}`);
            newSocket.emit('onlineUsers', onlineUserIds);
         }
      }

      // Send to all other users
      userSocketMap.forEach((socketId, userId) => {
         if (userId !== newUserId) {
            const socket = io.sockets.sockets.get(socketId);
            if (socket && socket.connected) {
               //console.log(`📢 Broadcasting online list to OTHER user ${userId}`);
               socket.emit('onlineUsers', onlineUserIds);
            }
         }
      });
   }, 200);
};