import { Kafka } from "kafkajs";
import Group from "../../../models/group";
import { Types } from "mongoose";
import { getSocketInstance } from "../../../utils/socketInstance";
import { userSocketMap } from "../../../socket/socket";
import GroupMessage from "../../../models/groupMessage";

const kafka = new Kafka({
   clientId: 'group-message-consumer',
   brokers: ['10.0.2.15:9092']
});

const addMemberToGroupDBConsumer = kafka.consumer({ groupId: 'add-member-db-group' });
const addMemberToGroupNotifyConsumer = kafka.consumer({ groupId: 'add-member-send-group' });

const removeMemberToGroupDBConsumer = kafka.consumer({ groupId: 'remove-member-db-group' });
const removeMemberToGroupNotifyConsumer = kafka.consumer({ groupId: 'remove-member-send-group' });

const saveMessageToDBConsumer = kafka.consumer({ groupId: 'group-message-db-group' });
const groupMessageNotifyConsumer = kafka.consumer({ groupId: 'group-message-send-group' });


export const startAddMemberToGroupDBConsumer = async () => {
   await addMemberToGroupDBConsumer.connect();
   await addMemberToGroupDBConsumer.subscribe({ topic: 'add-to-group', fromBeginning: false });

   await addMemberToGroupDBConsumer.run({
      eachMessage: async ({ message }) => {
         const { groupId, memberId } = JSON.parse(message.value!.toString());

         const group = await Group.findById(groupId);
         if (!group) {
            console.error('Group not found in consumer.');
            return;
         }
         const memId = new Types.ObjectId(memberId);

         group.members.push(memId);
         await group.save();

         console.log(`Member ${memberId} added to group ${group.name} in DB.`);
      }
   });
}

export const startAddMemberToGroupNotifyConsumer = async () => {
   await addMemberToGroupNotifyConsumer.connect();
   await addMemberToGroupNotifyConsumer.subscribe({ topic: 'add-to-group', fromBeginning: false });

   await addMemberToGroupNotifyConsumer.run({
      eachMessage: async ({ message }) => {
         const { memberId, groupName } = JSON.parse(message.value!.toString());

         //socket.io
         const io = getSocketInstance();
         const targetSocketId = userSocketMap.get(memberId);

         if (targetSocketId) {
            io.to(targetSocketId).emit('addedToGroup', `You have been added to Group ${groupName}`);
            console.log(`Notified user ${memberId} about group addition.`);
         }
      }
   });
}



export const startRemoveMemberToGroupDBConsumer = async () => {
   await removeMemberToGroupDBConsumer.connect();
   await removeMemberToGroupDBConsumer.subscribe({ topic: 'remove-to-group', fromBeginning: false });

   await removeMemberToGroupDBConsumer.run({
      eachMessage: async ({ message }) => {
         const { groupId, memberId, memberName } = JSON.parse(message.value!.toString());

         const group = await Group.findById(groupId);
         if (!group) {
            console.error('Group not found in consumer.');
            return;
         }
         const memId = new Types.ObjectId(memberId);

         // Check if member is in the group
         const isMember = group.members.some((id) => id.equals(memId));
         if (!isMember) {
            throw new Error(`${memberName} is not a member of the group.`);
         }

         // Prevent creator from removing themselves
         if (group.creator.equals(memId)) {
            throw new Error('Group creator cannot be removed.');
         }

         group.members = group.members.filter((id: Types.ObjectId) => !id.equals(memId));
         await group.save();

         console.log(`Member ${memberId} Removed from group ${group.name} in DB.`);
      }
   });
}

export const startRemoveMemberToGroupNotifyConsumer = async () => {
   await removeMemberToGroupNotifyConsumer.connect();
   await removeMemberToGroupNotifyConsumer.subscribe({ topic: 'remove-to-group', fromBeginning: false });

   await removeMemberToGroupNotifyConsumer.run({
      eachMessage: async ({ message }) => {
         const { memberId, groupName } = JSON.parse(message.value!.toString());

         //socket.io
         const io = getSocketInstance();
         const targetSocketId = userSocketMap.get(memberId);

         if (targetSocketId) {
            io.to(targetSocketId).emit('removeFromGroup', `You have been removed from Group ${groupName}`);
            console.log(`Notified user ${memberId} about group Removal.`);
         }
      }
   });
}


export const startGroupMessageDBConsumer = async () => {
   await saveMessageToDBConsumer.connect();
   await saveMessageToDBConsumer.subscribe({ topic: 'group-message', fromBeginning: false });

   await saveMessageToDBConsumer.run({
      eachMessage: async ({ message }) => {
         const parsed = JSON.parse(message.value!.toString());
         const { groupId, senderId, content, messageId } = parsed;

         await GroupMessage.updateOne(
            { messageId }, // filter by messageId
            {
               $setOnInsert: {
                  groupId,
                  senderId,
                  content
               }
            },
            { upsert: true }
         );

      }
   });
}

export const startGroupMessageNotifyConsumer = async () => {
   await groupMessageNotifyConsumer.connect();
   await groupMessageNotifyConsumer.subscribe({ topic: 'group-message', fromBeginning: false });

   await groupMessageNotifyConsumer.run({
      eachMessage: async ({ message }) => {
         const { groupId, senderId, messageId, content, createdAt } = JSON.parse(message.value!.toString());

         const messageData = {
            _id: messageId,
            groupId: groupId,
            senderId: senderId,
            content,
            createdAt: createdAt
         }

         //socket.io
         const io = getSocketInstance();
         const targetSocketId = groupId;

         if (targetSocketId) {
            io.to(targetSocketId).emit('newGroupMessage', messageData);
         }
      }
   });
}