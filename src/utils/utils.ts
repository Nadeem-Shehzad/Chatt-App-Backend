import { Socket } from "socket.io";
import Contact from "../models/contact";
import { IContact, IMessageDTO } from "./customTypes";
import { Result, ValidationError } from 'express-validator';
import { userSocketMap } from "../socket/socket";
import { getSocketInstance } from "./socketInstance";
import { Server } from "socket.io";
import Message from "../models/message";
import { Types } from "mongoose";
import nodemailer, { SendMailOptions, Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';



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


export const sendMessageToReceiver = async ({ senderId, receiverId, message }: { senderId: string; receiverId: string; message: IMessageDTO; }): Promise<boolean> => {

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

      // const unreadCount = await Message.countDocuments({
      //    sender: senderId,
      //    receiver: receiverId,
      //    seenAt: null,
      // });

      // // Emit individual unread count update
      // io.to(targetSocketId).emit('chatUnreadCount', {
      //    senderId,
      //    unreadCount,
      // });

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



export const getUnreadMessageSummary = async (userId: string) => {
   const summary = await Message.aggregate([
      {
         $match: {
            receiver: new Types.ObjectId(userId),
            seen: false,
         },
      },
      {
         $group: {
            _id: "$sender",
            unreadCount: { $sum: 1 },
            lastMessage: { $last: "$$ROOT" },
         },
      },
      {
         $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "senderInfo",
         },
      },
      {
         $unwind: "$senderInfo",
      },
      {
         $project: {
            senderId: "$_id",
            senderName: "$senderInfo.name", // adjust fields
            unreadCount: 1,
            lastMessage: {
               content: "$lastMessage.content",
               createdAt: "$lastMessage.createdAt",
            },
         },
      },
   ]);

   return summary;
};


export const handleUndeliveredMessages = async (userId: string, socket: Socket) => {

   const undeliveredMessages = await Message.find({
      receiver: userId,
      deliveredAt: null,
   }).sort({ createdAt: 1 });

   if (undeliveredMessages.length > 0) {
      socket.emit("undeliveredMessages", undeliveredMessages);

      const now = new Date();

      const bulkOps = undeliveredMessages.map((msg) => ({
         updateOne: {
            filter: { _id: msg._id },
            update: { $set: { deliveredAt: now } },
         },
      }));

      await Message.bulkWrite(bulkOps);

      undeliveredMessages.forEach((msg) => {
         msg.deliveredAt = now;
      });
   }
};


// auth 
export const generateOTP = () => {
   return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
};


const transporter: Transporter<SMTPTransport.SentMessageInfo> = nodemailer.createTransport({
   host: process.env.MAIL_HOST,
   port: Number(process.env.MAIL_PORT),
   secure: false,
   requireTLS: true,
   auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
   },
} as SMTPTransport.Options);


export const sendEmail = async ({ to, subject, data }: { to: string, data: string, subject: string }): Promise<void> => {
   try {
      const info = await transporter.sendMail({
         from: `"Chat-App" <${process.env.MAIL_USER}>`, 
         to,
         subject: subject,
         html: data,
      });

      console.log('✅ Email sent:', info.messageId);
   } catch (error) {
      console.error('❌ Failed to send otp email:', error);
   }
}


export const errorMsg = (errors: Result<ValidationError>): string => {
   const firstError = errors.array({ onlyFirstError: true })[0];

   const field = (firstError as any).param || (firstError as any).path || 'Field';
   const message = (firstError as any).msg || 'Invalid input';

   return `${field}: ${message}`;
};