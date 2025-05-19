import express, { Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import './utils/customTypes';
import './utils/types';

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ExpressContextFunctionArgument } from '@apollo/server/express4';
import { typeDefs } from './graphql/schemas/user/user';
import { resolvers } from './graphql/resolvers/user';
import { MyContext } from './utils/customTypes';

import authRoutes from './routes/auth';
import { tokenValidation } from './middlewares/tokenValidation';

import { connectDB } from './config/db_connect';

import { createServer } from 'http';
import { Server as SocketIOserver } from 'socket.io';
import setupSocket from './socket/socket';
import { setSocketInstance } from './utils/socketInstance';


dotenv.config();
const app: Application = express();
const PORT = process.env.PORT || 3000;

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


app.use(cors());
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

   app.use(
      '/graphql',
      gql_middlewale as unknown as express.RequestHandler
   );

   server.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log(`🚀 GraphQL endpoint at http://localhost:${PORT}/graphql`);
   });
};

startApolloServer();