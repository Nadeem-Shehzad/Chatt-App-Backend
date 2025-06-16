import { Query } from "mongoose";
import {
   createGroup,
   addMemberToGroup,
   removeMemberFromGroup,
   getMyGroups,
   getGroupMessages,
   sendMessageToGroup,
   markGroupMessageAsRead
} from "../../controllers/group/group";


export const groupResolver = {
   Query:{
      getMyGroups: getMyGroups,
      getGroupMessages: getGroupMessages
   },

   Mutation: {
      createGroup: createGroup,
      addMemberToGroup: addMemberToGroup,
      removeMemberFromGroup: removeMemberFromGroup,
      sendMessageToGroup: sendMessageToGroup,
      markGroupMessageAsRead: markGroupMessageAsRead
   }
}

