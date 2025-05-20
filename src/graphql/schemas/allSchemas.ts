import { gql } from 'graphql-tag';

import { userTypeDefs } from './user/user';
import { messageTypeDefs } from './message/message';
import { contactTypeDefs } from './contact/contact';


export const typeDefs = gql`
  ${userTypeDefs}
  ${messageTypeDefs}
  ${contactTypeDefs}
`;