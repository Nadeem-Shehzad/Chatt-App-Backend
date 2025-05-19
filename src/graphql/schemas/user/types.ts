import { gql } from 'graphql-tag';


export const UserTypes = gql`
  type User{
    username: String!
    email: String!
    password: String!
  }
`;


export const ResponseTypes = gql`
  type GetUserResponse {
    success: Boolean!
    message: String!
    data: User
  }

  type GetUsersResponse {
    success: Boolean!
    message: String!
    data: [User]
  }
`; 