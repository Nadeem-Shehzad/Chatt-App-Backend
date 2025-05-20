import { gql } from 'graphql-tag';


export const MessageTypes = gql`
  type Message {
    id: ID!
    sender: ID!
    receiver: ID!
    content: String!
    delivered: Boolean!
  }
`;


export const MessageResponse = gql`
  type MessageResponse {
    success: Boolean!
    message: String!
    data: Message
  }
`;