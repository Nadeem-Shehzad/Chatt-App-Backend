import {gql} from 'graphql-tag';


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