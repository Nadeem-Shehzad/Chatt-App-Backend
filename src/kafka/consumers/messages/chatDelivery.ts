import { Kafka } from "kafkajs";
import { getSocketInstance } from "../../../utils/socketInstance";
import { userSocketMap } from "../../../socket/socket";
import Message from "../../../models/message";
import { Types } from "mongoose";


const kafka = new Kafka({
   clientId: 'chat-delivery-consumer',
   brokers: ['10.0.2.15:9092']
});

const consumer = kafka.consumer({ groupId: 'chat-group-delivery' });

export const startChatDeliveryConsumer = async () => {
   await consumer.connect();
   await consumer.subscribe({ topic: 'chat-message', fromBeginning: false });

   await consumer.run({
      eachMessage: async ({ message }) => {
         const parsed = JSON.parse(message.value!.toString());
         const io = getSocketInstance();
         const targetSocketId = userSocketMap.get(parsed.receiverId);

         if (targetSocketId) {
            const deliveredAt = new Date();

            const messageData = {
               _id: parsed.messageId,
               sender: parsed.senderId,
               receiver: parsed.receiverId,
               content: parsed.content,
               createdAt: parsed.createdAt,
               deliveredAt,
            };   

            io.to(targetSocketId).emit('newMessage', messageData);

            // Safely update deliveredAt in DB
            await Message.findByIdAndUpdate(
               new Types.ObjectId(parsed.messageId), 
               { deliveredAt }
            );
            console.log(`Message delivered to ${parsed.receiverId} via socket.`);
         } else {
            console.log(`Receiver ${parsed.receiverId} is offline. Message not delivered yet.`);
         }
      }
   });
}