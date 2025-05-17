import {gql} from 'graphql-tag';


export const typeDefs  = gql`
  type User{
    username: String!
    email: String!
    password: String!
  }

  type Query{
    me: User!
    getUser: String!
  }
`; 