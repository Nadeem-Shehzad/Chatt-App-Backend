import { gql } from 'graphql-tag';

import { 
   MessageTypes, 
   MessageResponse, 
   MessagesResponse,
   UserSummary,
   ChatSummary,
   ChatsResponse 
} from './types';


export const messageTypeDefs = gql`

 ${MessageTypes}
 ${MessageResponse}
 ${MessagesResponse}

 ${UserSummary}
 ${ChatSummary}
 ${ChatsResponse}


 type Query{
    getMessages(receiverId: String!): MessagesResponse!
    getAllChats: ChatsResponse
 }

 type Mutation{
    sendMessage(receiverId: ID!, content: String!): MessageResponse
    deleteMessage(messageId: ID!): MessageResponse
 }

`;