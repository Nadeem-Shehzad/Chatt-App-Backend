import { Kafka } from "kafkajs";
import { getSocketInstance } from "../../../utils/socketInstance";
import { userSocketMap } from "../../../socket/socket";
import Contact from "../../../models/contact";


const kafka = new Kafka({
   clientId: 'contact-request-consumer',
   brokers: ['10.0.2.15:9092']
});

const consumer1 = kafka.consumer({ groupId: 'contact-request-save-group' });

const consumer2 = kafka.consumer({ groupId: 'contact-request-send-group' });


export const startSaveContactConsumer = async () => {
   await consumer1.connect();
   console.log('✅ [Consumer] contact-request-save-group connected'); 
   await consumer1.subscribe({ topic: 'contact-request', fromBeginning: false });
   console.log('✅ [Consumer] contact-request-save-group subscribed to contact-request');

   await consumer1.run({
      eachMessage: async ({ message }) => {
         const parsed = JSON.parse(message.value!.toString());

         const { contactId, senderId, receiverId, createdAt } = parsed;

         const existing = await Contact.findById(contactId);
         if (existing) {
            console.log(`Contact already exists between ${senderId} and ${receiverId}.`);
            return;
         }

         await Contact.create({
            _id: contactId,
            requester: senderId,
            receiver: receiverId,
            status: 'pending'
         });

         console.log(`Contact request saved in DB by contact-request consumer.`);
      }
   });
}


export const startSendContactRequestConsumer = async () => {
   await consumer2.connect();
   console.log('✅ [Consumer] contact-request-send-group connected');
   await consumer2.subscribe({ topic: 'contact-request', fromBeginning: false });
   console.log('✅ [Consumer] contact-request-send-group subscribed to contact-request');

   await consumer2.run({
      eachMessage: async ({ message }) => {
         const parsed = JSON.parse(message.value!.toString());

         const io = getSocketInstance();
         const targetSocketId = userSocketMap.get(parsed.receiverId);
         if (targetSocketId) {
            io.to(targetSocketId).emit('contactRequestReceived', {
               contactId: parsed.contactId,
               from: parsed.senderId,
            });
         }
      }
   });
}