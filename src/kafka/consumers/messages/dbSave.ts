import { Kafka } from "kafkajs";
import Message from "../../../models/message";
import { Types } from "mongoose";

const kafka = new Kafka({
   clientId: 'chat-db-consumer',
   brokers: ['10.0.2.15:9092']
});

const consumer = kafka.consumer({ groupId: 'chat-group-db' });

export const startMessageDBSaveConsumer = async () => {
   await consumer.connect();
   await consumer.subscribe({ topic: 'save-in-db' });

   await consumer.run({
      eachMessage: async ({ message }) => {
         const parsed = JSON.parse(message.value!.toString());

         // Save message in DB with deliveredAt = null
         const _id = new Types.ObjectId(parsed.messageId);
         const sender = new Types.ObjectId(parsed.senderId);
         const receiver = new Types.ObjectId(parsed.receiverId);

         // Insert only if it doesn't exist (prevent duplicates)
         await Message.updateOne(
            { _id }, // filter by messageId
            {
               $setOnInsert: {
                  sender,
                  receiver,
                  content: parsed.content,
                  deliveredAt: null,
                  seen: false,
                  seenAt: null,
                  createdAt: parsed.createdAt
               }
            },
            { upsert: true }
         );

         console.log(`✅ Message saved to DB by save-in-db consumer.`);
      }
   });
}