import { Types } from "mongoose";
import Contact from "../../models/contact";
import User from "../../models/user";
import { userSocketMap } from "../../socket/socket";
import {
   MyContext,
   ContactResponse,
   ContactsResponse,
   NContact,
   IContactUser,
   OnlineUsersResponse,
   IOnlineUser
} from "../../utils/customTypes";

import { getSocketInstance } from "../../utils/socketInstance";
import OnlineUser from "../../models/onlineUser";
import { compose, ErrorHandling, isAuthenticated } from "../../middlewares/common";
import { produceAcceptContactRequest } from "../../kafka/producer";



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

      const payload = {
         contactId,
         receiverId: contact.receiver,
         requesterId: contact.requester
      };

      await produceAcceptContactRequest(payload);

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


export const getContacts = async (_: any, __: any, context: MyContext): Promise<ContactsResponse> => {
   const userId = context.userId;

   const contacts = await Contact.find({
      $or: [
         { requester: userId, status: 'accepted' },
         { receiver: userId, status: 'accepted' }
      ]
   }).populate('requester', 'username email').populate('receiver', 'username email');

   const contactList: NContact[] = contacts.map(contact => {
      const requester = contact.requester as any;
      const receiver = contact.receiver as any;

      const otherUser: IContactUser = requester._id.toString() === userId ? receiver : requester;

      return {
         _id: contact._id as Types.ObjectId,
         user: otherUser,
         status: contact.status
      };
   });

   return {
      success: true,
      message: 'All Contacts',
      data: contactList
   }
}


export const getOnlineUsers = compose(ErrorHandling,isAuthenticated)(async (_: any, __: any, context: MyContext): Promise<OnlineUsersResponse> => {
   const userId = context.userId;

   const onlineUsersRaw = await OnlineUser.find({ userId: { $ne: userId } })
      .populate<{ userId: { _id: Types.ObjectId; username: string } }>('userId', 'username')
      .lean();

   const onlineUsers: IOnlineUser[] = onlineUsersRaw.map((e) => ({
         _id: e.userId._id,
         username: e.userId.username,
      }));

   return {
      success: true,
      message: 'Online Users',
      data: onlineUsers
   }
});