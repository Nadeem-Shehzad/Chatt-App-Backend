
import { startContactAcceptDBConsumer, startContactAcceptNotifyConsumer } from './contact/accept';
import { startSaveContactConsumer, startSendContactRequestConsumer } from './contact/request'
import { startChatDeliveryConsumer } from './messages/chatDelivery';
import { startMessageDBSaveConsumer } from './messages/dbSave';
import { startAddMemberToGroupDBConsumer, startAddMemberToGroupNotifyConsumer, startGroupMessageDBConsumer, startGroupMessageNotifyConsumer, startRemoveMemberToGroupDBConsumer, startRemoveMemberToGroupNotifyConsumer } from './messages/group';

export const startAllKafkaConsumers = async () => {
   try {
      await Promise.all([
         startSaveContactConsumer(),
         startSendContactRequestConsumer(),

         startContactAcceptDBConsumer(),
         startContactAcceptNotifyConsumer(),

         startMessageDBSaveConsumer(),
         startChatDeliveryConsumer(),

         startAddMemberToGroupDBConsumer(),
         startAddMemberToGroupNotifyConsumer(),

         startGroupMessageDBConsumer(),
         startGroupMessageNotifyConsumer(),

         startRemoveMemberToGroupDBConsumer(),
         startRemoveMemberToGroupNotifyConsumer()
      ]);

      console.log("All Kafka consumers started successfully."); 
   } catch (err) {
      console.error("Error starting Kafka consumers:");
   }
};