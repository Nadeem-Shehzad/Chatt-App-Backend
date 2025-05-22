import { gql } from 'graphql-tag';


export const ContactType = gql`
  type Contact {
   id: ID!
   requester: ID!
   receiver: ID!
   status: String!
   # createdAt: String!
   # updatedAt: String!
}
`;

export const ContactResponse = gql`
  type ContactResponse {
   success: Boolean!
   message: String!
   data: Contact
  }
`;

export const ContactsResponse = gql`
  type ContactsResponse {
   success: Boolean!
   message: String!
   data: [Contact]
  }
`;


export const ContactUser = gql`
  type ContactUser {
    _id: ID!
    username: String!
    email: String!
  }
`;

export const NContactType = gql`
  type NContact {
   _id: ID!
  user: ContactUser!  # Only the other user
  status: String!
}
`;

export const NContactsResponse = gql`
  type NContactsResponse {
    success: Boolean!
    message: String!
    data: [NContact!]
}`;


export const OnlineUser = gql`
  type OnlineUser{
    _id: ID!
    username: String!
  } 
`;

export const OnlineUsersResponse = gql`
  type OnlineUsersResponse{
    success: Boolean!
    message: String!
    data: [OnlineUser]
}`;