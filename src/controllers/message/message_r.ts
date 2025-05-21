import { Types } from 'mongoose';
import Message from '../../models/message';
import { IMessageDTO, MessageResponse, MyContext } from '../../utils/customTypes';
import Contact from '../../models/contact';
import { compose, ErrorHandling, isAuthenticated, checkContent } from '../../middlewares/common';
import { checkContactStatus, sendNewContactRequest, sendMessageToReceiver } from '../../utils/utils';


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
         id: createdMessage._id as Types.ObjectId,
         sender: createdMessage.sender,
         receiver: createdMessage.receiver,
         content: createdMessage.content,
         delivered: isDelivered,
      };

      return {
         success: true,
         message: isDelivered
            ? 'Message sent and delivered successfully'
            : 'Message sent, but receiver is offline',
         data: savedMessage,
      };
   });


export const getMessages = compose(ErrorHandling, isAuthenticated)(async (): Promise<String> => {
   console.log('Welcome in GetMessages API.');
   return 'Hi and Hello ...';
});