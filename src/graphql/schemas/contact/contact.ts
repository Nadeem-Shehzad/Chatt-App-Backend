import { gql } from 'graphql-tag';
import { ContactType, ContactResponse } from './types'


export const contactTypeDefs = gql`

${ContactType}
${ContactResponse}

 type Mutation{
    sendContactRequest(receiverId: ID!): ContactResponse
    acceptContactRequest(contactId: ID!): ContactResponse
    blockContact(contactId: ID!): ContactResponse
 } 

`;