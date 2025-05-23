import {
   createGroup,
   addMemberToGroup,
   removeMemberFromGroup,
   sendMessageToGroup,
   markGroupMessageAsRead
} from "../../controllers/group/group";


export const groupResolver = {
   Mutation: {
      createGroup: createGroup,
      addMemberToGroup: addMemberToGroup,
      removeMemberFromGroup: removeMemberFromGroup,
      sendMessageToGroup: sendMessageToGroup,
      markGroupMessageAsRead: markGroupMessageAsRead
   }
}

