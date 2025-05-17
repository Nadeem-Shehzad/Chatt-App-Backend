import express, { Application,Request } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import './utils/customTypes';
import './utils/types';

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ExpressContextFunctionArgument } from '@apollo/server/express4';

import { typeDefs } from './graphql/schemas/user';
import { resolvers } from './graphql/resolvers/user';

import authRoutes from './routes/auth';

import { tokenValidation } from './middlewares/tokenValidation';
import { MyContext } from './utils/customTypes';
import { connectDB } from './config/db_connect';

dotenv.config();
const app: Application = express();
const PORT = process.env.PORT || 3000;

connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// REST Route
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

   app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log(`🚀 GraphQL endpoint at http://localhost:${PORT}/graphql`);
   });
};

startApolloServer();