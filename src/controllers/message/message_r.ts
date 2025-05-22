import { Types } from 'mongoose';
import Message from '../../models/message';
import { IMessageDTO, MessageResponse, MessagesResponse, MyContext, AllChatsResponse, ChatSummary } from '../../utils/customTypes';
import Contact from '../../models/contact';
import { compose, ErrorHandling, isAuthenticated, checkContent } from '../../middlewares/common';
import { checkContactStatus, sendNewContactRequest, sendMessageToReceiver } from '../../utils/utils';
import User from '../../models/user';


export const sendMessage = compose(ErrorHandling, isAuthenticated, checkContent)
   (async (_: any, { receiverId, content }: { receiverId: string, content: string }, context: MyContext): Promise<MessageResponse> => {

      const senderId = context.userId;

      if (!senderId || !receiverId) {
         return {
            success: false,
            message: 'Sender or receiver not found.',
            data: null,
         };
      }

      const existingContact = await Contact.findOne({
         $or: [
            { requester: senderId, receiver: receiverId },
            { requester: receiverId, receiver: senderId }
         ]
      });

      if (!existingContact) {
         return await sendNewContactRequest({ senderId: senderId, receiverId: receiverId });
      }

      if (existingContact) {
         const statusCheck = checkContactStatus({ contact: existingContact });
         if (statusCheck) return statusCheck;
      }

      const createdMessage = await Message.create({
         sender: senderId,
         receiver: receiverId,
         content,
      });

      const isDelivered = await sendMessageToReceiver({
         senderId: senderId,
         receiverId: receiverId,
         message: createdMessage
      });

      const savedMessage: IMessageDTO = {
         _id: createdMessage._id as Types.ObjectId,
         sender: createdMessage.sender,
         receiver: createdMessage.receiver,
         content: createdMessage.content,
         delivered: isDelivered,
         createdAt: createdMessage.createdAt,
         updatedAt: createdMessage.updatedAt
      };

      return {
         success: true,
         message: isDelivered
            ? 'Message sent and delivered successfully'
            : 'Message sent, but receiver is offline',
         data: savedMessage,
      };
   });


export const getMessages = compose(ErrorHandling, isAuthenticated)(async (_: any, { receiverId }: { receiverId: string }, context: MyContext): Promise<MessagesResponse> => {

   const senderId = context.userId;
   const messages = await Message.find({
      $or: [
         { sender: senderId, receiver: receiverId },
         { sender: receiverId, receiver: senderId }
      ]
   });

   return {
      success: true,
      message: 'All Messages',
      data: messages
   };
});


export const getAllChats = compose(ErrorHandling, isAuthenticated)(async (_: any, __: any, context: MyContext): Promise<AllChatsResponse> => {

   const objectUserId = new Types.ObjectId(context.userId);

   // Aggregate to get last message per chat partner
   const messages = await Message.aggregate([
      {
         $match: {
            $or: [
               { sender: objectUserId },
               { receiver: objectUserId }
            ]
         }
      },
      {
         $sort: { createdAt: -1 }
      },
      {
         $project: {
            sender: 1,
            receiver: 1,
            content: 1,
            createdAt: 1,
            chatUser: {
               $cond: [
                  { $eq: ["$sender", objectUserId] },
                  "$receiver",
                  "$sender"
               ]
            }
         }
      },
      {
         $group: {
            _id: "$chatUser",
            lastMessage: { $first: "$content" },
            createdAt: { $first: "$createdAt" }
         }
      },
      {
         $sort: { createdAt: -1 }
      }
   ]);

   //console.log("Chat summaries:", messages);

   const chatSummaries = await Promise.all(
      messages.map(async (msg) => {
         const user = await User.findById(msg._id).lean(); // or use a batch query if needed

         return {
            user: {
               _id: msg._id,
               username: user?.username || 'Unknown'
            },
            lastMessage: msg.lastMessage,
            time: msg.createdAt instanceof Date
               ? msg.createdAt.toISOString()
               : new Date().toISOString() // fallback just in case
         };
      })
   );

   return {
      success: true,
      message: 'All Chats',
      data: chatSummaries
   };
});


export const deleteMessage = compose(ErrorHandling, isAuthenticated)(async (_: any, { messageId }: { messageId: string }, context: MyContext): Promise<MessageResponse> => {

   const senderId = context.userId;

   const message = await Message.findById(messageId);
   if (!message) {
      throw new Error('Message not found!');
   }

   if (message.sender.toString() !== senderId) {
      throw new Error(`You can't delete other's message.`);
   }

   const deletedMessage = await Message.findByIdAndDelete(messageId);

   return {
      success: true,
      message: 'Message deleted successfully',
      data: null
   };
});