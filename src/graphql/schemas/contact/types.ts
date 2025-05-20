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