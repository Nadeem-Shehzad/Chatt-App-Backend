import {gql} from 'graphql-tag';
import { GroupType, GroupResponse } from './types';

export const groupTypeDefs = gql`

 ${GroupType}
 ${GroupResponse}

 type Mutation{
    createGroup(name:String!, description: String!): GroupResponse
    addMemberToGroup(groupId: String!, memberId: String!): GroupResponse
    removeMemberFromGroup(groupId: String!, memberId: String!): GroupResponse
    sendMessageToGroup(groupId: String!, content:String!): GroupResponse
    markGroupMessageAsRead(groupId: String!): GroupResponse
 }

`;