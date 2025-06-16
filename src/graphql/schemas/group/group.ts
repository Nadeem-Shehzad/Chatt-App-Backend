import {gql} from 'graphql-tag';
import { GroupType, GroupResponse, GroupsResponse, LastMessageInfo, GroupLastMessage, GroupMessage, GroupMessagesResponse } from './types';

export const groupTypeDefs = gql`

 ${GroupType}
 ${GroupResponse}
 ${LastMessageInfo}
 ${GroupLastMessage}
 ${GroupsResponse}
 ${GroupMessage}
 ${GroupMessagesResponse}

 type Query{
    getMyGroups: GroupsResponse
    getGroupMessages(groupId: String!): GroupMessagesResponse
 }

 type Mutation{
    createGroup(name:String!, description: String!): GroupResponse
    addMemberToGroup(groupId: String!, memberId: String!): GroupResponse
    removeMemberFromGroup(groupId: String!, memberId: String!): GroupResponse
    sendMessageToGroup(groupId: String!, content:String!): GroupResponse
    markGroupMessageAsRead(groupId: String!): GroupResponse
 }

`;