
import dotenv from 'dotenv';
dotenv.config();

import express, { Application } from 'express';
import cors from 'cors';

import './utils/customTypes';
import './utils/types';
 
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ExpressContextFunctionArgument } from '@apollo/server/express4';
import { typeDefs } from './graphql/schemas/allSchemas';
import { resolvers } from './graphql/resolvers/allResolvers';
import { MyContext } from './utils/customTypes';

import authRoutes from './routes/auth';
import { tokenValidation } from './middlewares/tokenValidation';

import { connectDB } from './config/db_connect';
import fileUpload from 'express-fileupload';

import { createServer } from 'http';
import { Server as SocketIOserver } from 'socket.io';
import setupSocket from './socket/socket';
import { setSocketInstance } from './utils/socketInstance';

import { startAllKafkaConsumers } from './kafka/consumers/allConsumers';
import { connectProducer } from './kafka/producer';
import { connectRedis } from './config/redis';
import redisRateLimiter from './middlewares/rateLimiter';

import { connectRedisPubSub } from './config/redisPubSub';
import { subscribeToTypingEvents } from './redis/typingSubscriber';


const app: Application = express();
const PORT = process.env.PORT;

connectDB();

// socket.io setup
const server = createServer(app);
const io = new SocketIOserver(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
})

// Store socket instance globally
setSocketInstance(io);
setupSocket(io); 

// to get temp files like images
app.use(fileUpload({
  useTempFiles: true,
  limits: { fileSize: 50 * 2024 * 1024 }
}));

app.use(cors());
//app.use(redisRateLimiter);
app.use(express.json());

app.use('/api/auth', authRoutes);

// Apollo Server setup
const apolloServer = new ApolloServer({
   typeDefs,
   resolvers,
   formatError: (error) => {
      return { message: error.message };
   },
});

// Start GraphQL server and integrate with Express
const startApolloServer = async (): Promise<void> => {
   
   await connectRedis();
   await connectRedisPubSub();            
   await subscribeToTypingEvents();

   await apolloServer.start();

   const gql_middlewale = expressMiddleware(apolloServer, {
      context: async ({ req }: ExpressContextFunctionArgument): Promise<MyContext> => {
         const contextData = await tokenValidation({ req });
         return {
            userId: contextData.userId,
            email: contextData.email,
         };
      },
   });
   
   app.use( '/graphql',gql_middlewale as unknown as express.RequestHandler);

   // connect producer
   await connectProducer();

   // Start Kafka consumers before server starts listening
   await startAllKafkaConsumers();

   server.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log(`🚀 GraphQL endpoint at http://localhost:${PORT}/graphql`);
   });
};

startApolloServer();