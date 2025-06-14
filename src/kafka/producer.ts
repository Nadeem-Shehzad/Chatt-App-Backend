import { Kafka, Partitioners } from 'kafkajs';

const kafka = new Kafka({
   clientId: 'chat-service',
   brokers: ['10.0.2.15:9092']
})

export const kafkaProducer = kafka.producer({
   createPartitioner: Partitioners.LegacyPartitioner,
});


export const connectProducer = async () => {
   await kafkaProducer.connect();
   console.log('Kafka producer connected');
}


export const produceChatMessage = async (message: any) => {

   await kafkaProducer.send({
      topic: 'chat-message',
      messages: [{ value: JSON.stringify(message) }]
   });

   console.log('Message sent to chat-messages topic ...');
}


export const produceSaveInDB = async (message: any) => {

   await kafkaProducer.send({
      topic: 'save-in-db',
      messages: [{ value: JSON.stringify(message) }]
   });

   console.log('Message sent to save-in-db topic.');
}


export const produceContactRequest = async (contact: any) => {

   await kafkaProducer.send({
      topic: 'contact-request',
      messages: [{ value: JSON.stringify(contact) }]
   });

   console.log('Request sent contact-request topic.');
}


export const produceAcceptContactRequest = async (contact: any) => {
   await kafkaProducer.send({
      topic: 'contact-accept',
      messages: [{ value: JSON.stringify(contact) }]
   });

   console.log('Request Accepted sent contact-accepted topic.');
}


export const produceGroupMessage = async (message: any) => {

   await kafkaProducer.send({
      topic: 'group-message',
      messages: [{ value: JSON.stringify(message) }]
   });

   console.log('Message sent to group-message topic.');
};


export const produceAddToGroup = async (message: any) => {

   await kafkaProducer.send({
      topic: 'add-to-group',
      messages: [{ value: JSON.stringify(message) }]
   });

   console.log('Message sent to add-to-group topic.');
};


export const produceRemoveToGroup = async (message: any) => {

   await kafkaProducer.send({
      topic: 'remove-to-group',
      messages: [{ value: JSON.stringify(message) }]
   });

   console.log('Message sent to remove-to-group topic.');
};