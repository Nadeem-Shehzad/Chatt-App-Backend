import { GroupResponse, MyContext, GroupMessageResponse, IGroupMessage, GroupsResponse, UserGroupsResponse, GroupMessagesResponse } from "../../utils/customTypes";
import { compose, ErrorHandling, groupExists, isAuthenticated, rateLimit } from "../../middlewares/common";
import Group from "../../models/group";
import User from "../../models/user";
import mongoose, { Types } from "mongoose";
import GroupMessage from "../../models/groupMessage";
import { produceAddToGroup, produceGroupMessage, produceRemoveToGroup } from "../../kafka/producer";
import Message from "../../models/message";
import { redisClient } from "../../config/redis";


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


export const addMemberToGroup = compose(ErrorHandling, isAuthenticated,rateLimit({ keyPrefix: 'addMemberToGroup', limit: 10, windowInSeconds: 60 }))(async (_: any, { groupId, memberId }: { groupId: string, memberId: string }, context: MyContext): Promise<GroupResponse> => {

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


export const removeMemberFromGroup = compose(ErrorHandling, isAuthenticated,rateLimit({ keyPrefix: 'removeMemberFromGroup', limit: 10, windowInSeconds: 60 }))(async (_: any, { groupId, memberId }: { groupId: string, memberId: string }, context: MyContext): Promise<GroupResponse> => {

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


export const sendMessageToGroup = compose(ErrorHandling, isAuthenticated, rateLimit({ keyPrefix: 'sendMessageToGroup', limit: 15, windowInSeconds: 60 }))(async (_: any, { groupId, content }: { groupId: string, content: string }, context: MyContext): Promise<GroupMessageResponse> => {

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


export const getMyGroups = compose(ErrorHandling, isAuthenticated)(async (_: any, __: any, context: MyContext): Promise<UserGroupsResponse> => {

   const userId = context.userId;
   const chacheKey = `myGroups:${userId}`;

   const chachedGroups = await redisClient.get(chacheKey);
   if (chachedGroups) {
      console.log('from chache');
      return JSON.parse(chachedGroups);
   }

   const groups = await Group.find({ members: userId }).select("name").exec();

   // For each group, fetch the latest group message
   const groupsWithLastMessage = await Promise.all(
      groups.map(async (group) => {
         const lastMessage = await GroupMessage.findOne({ groupId: group._id })
            .sort({ createdAt: -1 })
            .select("content senderId createdAt")
            .populate("senderId", "username")
            .exec();

         return {
            groupName: group.name,
            lastMessage: lastMessage
               ? {
                  content: lastMessage.content,
                  sender: (lastMessage.senderId as any).username,
                  createdAt: lastMessage.createdAt,
               }
               : {
                  content: "",
                  sender: "",
                  createdAt: null as unknown as Date,
               },
         };
      })
   );

   const response = {
      success: true,
      message: `Your Groups`,
      data: groupsWithLastMessage
   }

   await redisClient.set(chacheKey, JSON.stringify(response), { EX: 7200 });

   return response;
});


export const getGroupMessages = compose(ErrorHandling, isAuthenticated, groupExists)(async (_: any, { groupId }: { groupId: string }, context: MyContext): Promise<GroupMessagesResponse> => {

   const userId = context.userId;
   const chacheKey = `groupMessages:${groupId}`;

   const chachedGroupMessages = await redisClient.get(chacheKey);
   if (chachedGroupMessages) {
      console.log('from chached group messages...');
      return JSON.parse(chachedGroupMessages);
   }

   const groupMessages = await GroupMessage.find({ groupId })
      .select("senderId content createdAt")
      .populate("senderId", "username");

   const mappedMessages = groupMessages.map((msg) => ({
      content: msg.content,
      sender: (msg.senderId as any).username,
      createdAt: msg.createdAt,
   }));

   const response = {
      success: true,
      message: `Your Groups`,
      data: mappedMessages
   }

   await redisClient.set(chacheKey, JSON.stringify(response), { EX: 7200 });

   return response;
});