import { gql } from 'graphql-tag';


export const MessageTypes = gql`
  type Message {
    id: ID!
    sender: ID!
    receiver: ID!
    content: String!
    #delivered: Boolean!
  }
`;


export const MessageResponse = gql`
  type MessageResponse {
    success: Boolean!
    message: String!
    data: Message
  }
`;


export const MessagesResponse = gql`
  type MessagesResponse {
    success: Boolean!
    message: String!
    data: [Message]
  }
`;


export const UserSummary = gql`
  type UserSummary {
    _id: ID!
    username: String!
  }
`;

export const ChatSummary = gql`
  type ChatSummary {
   user: UserSummary!
   lastMessage: String!
   time: String!
   unreadCount: Int!
  }
`;

export const ChatsResponse = gql`
  type ChatsResponse {
   success: Boolean!
   message: String!
   data: [ChatSummary]
  }
`;