import { gql } from 'graphql-tag';


export const GroupType = gql`
  type Group{
    name: String!
    creator: ID!
    description: String!
    members: [ID!]
  }
`;

export const GroupResponse = gql`
  type GroupResponse{
    success: Boolean!
    message: String!
    data: Group
  }
`;

export const LastMessageInfo = gql`
  type LastMessageInfo {
   content: String!
   sender: String!
   createdAt: String!
  }
`;

export const GroupLastMessage = gql`
  type GroupLastMessage {
    groupName: String!
    lastMessage: LastMessageInfo
  }
`;

export const GroupsResponse = gql`
  type GroupsResponse{
    success: Boolean!
    message: String!
    data: [GroupLastMessage!]
  }
`;

export const GroupMessage = gql`
  type GroupMessage{
    content: String!
    sender: String!
    createdAt: String!
  }
`;

export const GroupMessagesResponse = gql`
  type GroupMessagesResponse{
    success: Boolean!
    message: String!
    data: [GroupMessage!]
  }
`;