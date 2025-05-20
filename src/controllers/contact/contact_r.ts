import Contact from "../../models/contact";
import User from "../../models/user";
import { userSocketMap } from "../../socket/socket";
import { MyContext, ContactResponse } from "../../utils/customTypes";
import { getSocketInstance } from "../../utils/socketInstance";



export const sendContactRequest = async (_: any, { receiverId }: { receiverId: string }, context: MyContext): Promise<ContactResponse> => {
   const senderId = context.userId;

   try {
      if (!senderId) {
         return { success: false, message: 'Unauthorized', data: null };
      }

      if (receiverId === senderId) {
         return { success: false, message: 'Cannot send request to self', data: null };
      }

      const receiverExists = await User.findById(receiverId);
      if (!receiverExists) {
         return { success: false, message: 'Receiver not found', data: null };
      }

      const existing = await Contact.findOne({
         requester: senderId,
         receiver: receiverId,
      });

      if (existing) {
         return { success: false, message: 'Request already sent or exists', data: null };
      }

      const contact = await Contact.create({
         requester: senderId,
         receiver: receiverId,
         status: 'pending',
      });

      // 🔌 Socket.io Emit to receiver
      const io = getSocketInstance();
      const targetSocketId = userSocketMap.get(receiverId);

      if (targetSocketId) {
         io.to(targetSocketId).emit('contactRequestReceived', {
            contactId: contact._id,
            from: senderId,
         });
      }

      return { success: true, message: 'Contact request sent', data: null };

   } catch (err) {
      console.error('Send Contact Request Error:', err);
      return {
         success: false,
         message: 'Failed to send contact request',
         data: null
      };
   }
}


export const acceptContactRequest = async (_: any, { contactId }: { contactId: string }, context: MyContext): Promise<ContactResponse> => {

   const userId = context.userId;

   try {
      const contact = await Contact.findById(contactId);
      if (!contact || contact.receiver.toString() !== userId) {
         return { success: false, message: 'Invalid Request.', data: null };
      }

      contact.status = 'accepted';
      await contact.save();

      // Notify the requester via Socket.IO
      const io = getSocketInstance();
      const requesterSocketId = userSocketMap.get(contact.requester.toString());

      if (requesterSocketId) {
         io.to(requesterSocketId).emit('contactAccepted', {
            contactId: contact._id,
            by: userId,
         });
      }

      return { success: true, message: 'Contact request accepted', data: null };

   } catch (error) {
      return { success: false, message: 'Failed to Accpet Contact Request!', data: null };
   }
}

export const blockContact = async (_: any, { contactId }: { contactId: string }, context: MyContext): Promise<ContactResponse> => {
   const userId = context.userId;

   try {
      const contact = await Contact.findById(contactId);
      if (!contact || contact.receiver.toString() !== userId) {
         return { success: false, message: 'Invalid Request.', data: null };
      }

      contact.status = 'blocked';
      await contact.save();

      // Notify the requester via Socket.IO
      const io = getSocketInstance();
      const requesterSocketId = userSocketMap.get(contact.requester.toString());

      if (requesterSocketId) {
         io.to(requesterSocketId).emit('blockContact', {
            contactId: contact._id,
            by: userId,
         });
      }

      return { success: true, message: 'Contact request blocked', data: null };

   } catch (error) {
      return { success: false, message: 'Failed to Block Contact Request!', data: null };
   }

}