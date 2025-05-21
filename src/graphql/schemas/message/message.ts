import {gql} from 'graphql-tag';
import { MessageTypes, MessageResponse } from './types';


export const messageTypeDefs = gql`

 ${MessageTypes}
 ${MessageResponse}


 type Query{
   getMessages: String!
 }

 type Mutation{
    sendMessage(receiverId: ID!, content: String!): MessageResponse
 }

`;