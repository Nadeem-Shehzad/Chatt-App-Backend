import { GroupResponse, MyContext, GroupMessageResponse, IGroupMessage } from "../../utils/customTypes";
import { compose, ErrorHandling, groupExists, isAuthenticated } from "../../middlewares/common";
import Group from "../../models/group";
import User from "../../models/user";
import mongoose, { Types } from "mongoose";
import { getSocketInstance } from "../../utils/socketInstance";
import { userSocketMap } from "../../socket/socket";
import GroupMessage from "../../models/groupMessage";
import { produceAddToGroup, produceGroupMessage, produceRemoveToGroup } from "../../kafka/producer";


export const createGroup = compose(ErrorHandling, isAuthenticated)(async (_: any, { name, description }: { name: string, description: string }, context: MyContext): Promise<GroupResponse> => {

   const userId = context.userId;

   const group = await Group.create({
      name,
      description,
      creator: userId,
      members: [userId], // initialize members during creation
   });

   if (!group) {
      return {
         success: false,
         message: `Group not created.`,
         data: null,
      };
   }

   return {
      success: true,
      message: `Group '${name}' created.`,
      data: group
   }
});


export const addMemberToGroup = compose(ErrorHandling, isAuthenticated)(async (_: any, { groupId, memberId }: { groupId: string, memberId: string }, context: MyContext): Promise<GroupResponse> => {

   const userId = context.userId;

   const group = await Group.findById(groupId);
   if (!group) {
      throw new Error('Group not Found!');
   }

   if (userId?.toString() !== group.creator.toString()) {
      throw new Error('You dont have access to add someone in this group!')
   }

   const member = await User.findById(memberId);
   if (!member) {
      throw new Error('Member not Found!');
   }

   const payload = {
      groupId,
      memberId,
      groupName: group.name,
      addedBy: userId
   };

   await produceAddToGroup(payload);

   return {
      success: true,
      message: `Group update requested — ${member.username} will be added shortly.`,
      data: null
   }
});


export const removeMemberFromGroup = compose(ErrorHandling, isAuthenticated)(async (_: any, { groupId, memberId }: { groupId: string, memberId: string }, context: MyContext): Promise<GroupResponse> => {

   const userId = context.userId;

   const group = await Group.findById(groupId);
   if (!group) {
      throw new Error('Group not Found!');
   }

   if (userId?.toString() !== group.creator.toString()) {
      throw new Error('You dont have access to remove someone from this group!')
   }

   const member = await User.findById(memberId);
   if (!member) {
      throw new Error('Member not Found!');
   }

   const payload = {
      groupId,
      memberId,
      memberName: member.username,
      groupName: group.name,
      removedBy: userId
   };

   await produceRemoveToGroup(payload);

   return {
      success: true,
      message: `${member.username} Remove from Group ${group.name}.`,
      data: null
   }
});


export const sendMessageToGroup = compose(ErrorHandling, isAuthenticated)(async (_: any, { groupId, content }: { groupId: string, content: string }, context: MyContext): Promise<GroupMessageResponse> => {

   const userId = context.userId;

   const group = await Group.findById(groupId);
   if (!group) {
      throw new Error('Group not Found!');
   }

   if (!userId) {
      throw new Error('User ID is undefined.');
   }

   const userObjectId = new Types.ObjectId(userId);
   const groupObjectId = new Types.ObjectId(groupId);

   if (!group.members.includes(userObjectId)) {
      throw new Error('You are not a member of this group!');
   }

   const messageId = new mongoose.Types.ObjectId().toString();
   const createdAt = new Date();

   const payload = {
      groupId: groupObjectId,
      senderId: userObjectId,
      messageId,
      content,
      createdAt
   };

   await produceGroupMessage(payload);

   // const gMessage = await GroupMessage.create({
   //    groupId: groupObjectId,
   //    senderId: userObjectId,
   //    content
   // });

   // message-data
   // const messageData = {
   //    _id: gMessage._id,
   //    groupId: groupObjectId,
   //    senderId: userObjectId,
   //    content,
   //    createdAt: gMessage.createdAt,
   //    updatedAt: gMessage.updatedAt
   // }

   // //socket.io
   // const io = getSocketInstance();
   // const targetSocketId = groupId;

   // if (targetSocketId) {
   //    io.to(targetSocketId).emit('newGroupMessage', messageData);
   // }

   return {
      success: true,
      message: `message send in group ${group.name}`,
      data: null
   }
});


export const markGroupMessageAsRead = compose(ErrorHandling, isAuthenticated, groupExists)(async (_: any, { groupId }: { groupId: string }, context: MyContext): Promise<GroupMessageResponse> => {

   const userId = context.userId;

   await GroupMessage.updateMany(
      // condition
      {
         groupId: new Types.ObjectId(groupId),
         seenBy: { $ne: userId }
      },
      // action
      {
         $addToSet: { seenBy: new Types.ObjectId(userId) }
      }
   );

   return {
      success: true,
      message: `Messages marked as seen.`,
      data: null
   }
});