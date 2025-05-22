import { gql } from 'graphql-tag';
import {
   ContactType,
   ContactResponse,
   ContactsResponse,
   NContactType,
   ContactUser,
   NContactsResponse,
   OnlineUser,
   OnlineUsersResponse
} from './types'


export const contactTypeDefs = gql`

${ContactType}
${ContactResponse}
${ContactsResponse}

# new 
${ContactUser}
${NContactType}
${NContactsResponse}

# online-users
${OnlineUser}
${OnlineUsersResponse}


 type Query{
   getContacts: NContactsResponse
   getOnlineUsers: OnlineUsersResponse
 }

 type Mutation{
   sendContactRequest(receiverId: ID!): ContactResponse
   acceptContactRequest(contactId: ID!): ContactResponse
   blockContact(contactId: ID!): ContactResponse
 } 

`;