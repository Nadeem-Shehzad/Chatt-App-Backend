import { Types } from 'mongoose';
import Message from '../../models/message';
import User from '../../models/user';
import { userSocketMap } from '../../socket/socket';
import { IMessage, IMessageDTO, MessageResponse, MyContext } from '../../utils/customTypes';
import { getSocketInstance } from '../../utils/socketInstance';
import Contact from '../../models/contact';


export const sendMessage = async (_: any, { receiverId, content }: { receiverId: string, content: string }, context: MyContext): Promise<MessageResponse> => {
   const senderId = context.userId;

   try {

      if (!senderId) {
         return { success: false, message: 'Unauthorized', data: null };
      }

      if (!content.trim()) {
         return { success: false, message: 'Message content is empty', data: null };
      }

      const receiverExists = await User.findById(receiverId);
      if (!receiverExists) {
         return { success: false, message: 'Receiver not found', data: null };
      }

      const isContactAccepted  = await Contact.findOne({
         $or: [
            { requester: senderId, receiver: receiverId, status: 'accepted' },
            { requester: receiverId, receiver: senderId, status: 'accepted' },
         ]
      });

      if (!isContactAccepted ) {
         return {
            success: false,
            message: 'You cannot message this user unless contact request is accepted.',
            data: null,
         };
      }

      const createdMessage = await Message.create({
         sender: senderId,
         receiver: receiverId,
         content,
      });

      const io = getSocketInstance();

      const targetSocketId = userSocketMap.get(receiverId);
      if (targetSocketId) {
         io.to(targetSocketId).emit('newMessage', {
            sender: senderId,
            receiver: receiverId,
            content,
            createdAt: createdMessage.createdAt,
         });

         createdMessage.delivered = true;
         await createdMessage.save();
      }

      const savedMessage: IMessageDTO = {
         id: createdMessage._id as Types.ObjectId,
         sender: createdMessage.sender,
         receiver: createdMessage.receiver,
         content: createdMessage.content,
         delivered: createdMessage.delivered,
      };

      return {
         success: true,
         message: 'Message sent successfully',
         data: savedMessage,
      };

   } catch (error) {
      console.error('Send Message Error:', error);
      return {
         success: false,
         message: 'Failed to send message',
         data: null,
      };
   }
};