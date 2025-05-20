import { gql } from 'graphql-tag';
import { UserTypes, ResponseTypes } from './types';


export const userTypeDefs = gql`

  ${UserTypes} 
  ${ResponseTypes}

  type Query {
    me: User!
    getUser(id: String!): GetUserResponse!
    getUsers: GetUsersResponse!
    searchUser(name: String!): GetUsersResponse
  }

  # type Mutation {
    
  # }
`; 