import { Kafka } from "kafkajs";
import { getSocketInstance } from "../../../utils/socketInstance";
import { userSocketMap } from "../../../socket/socket";
import Contact from "../../../models/contact";

const kafka = new Kafka({
   clientId: 'contact-accept-consumer',
   brokers: ['10.0.2.15:9092']
});

const dbConsumer = kafka.consumer({ groupId: 'contact-accept-save-group' });
const notifyConsumer = kafka.consumer({ groupId: 'contact-accept-send-group' });

export const startContactAcceptDBConsumer = async () => {
   await dbConsumer.connect();
   await dbConsumer.subscribe({ topic: 'contact-accept', fromBeginning: false });

   await dbConsumer.run({
      eachMessage: async ({ message }) => {
         const parsed = JSON.parse(message.value!.toString());

         const { contactId } = parsed;

         await Contact.findByIdAndUpdate(
            contactId,
            {
               $set: {
                  status: 'accepted'
               }
            },
            { new: true }
         );
      }
   });
}


export const startContactAcceptNotifyConsumer = async () => {
   await notifyConsumer.connect();
   await notifyConsumer.subscribe({ topic: 'contact-accept', fromBeginning: false });

   await notifyConsumer.run({
      eachMessage: async ({ message }) => {
         const parsed = JSON.parse(message.value!.toString());

         const { contactId, receiverId, requesterId } = parsed;

         // Notify the requester via Socket.IO
         const io = getSocketInstance();
         const requesterSocketId = userSocketMap.get(requesterId.toString());

         if (requesterSocketId) {
            io.to(requesterSocketId).emit('contactAccepted', {
               contactId: contactId,
               by: receiverId,
            });
         }
      }
   });
}