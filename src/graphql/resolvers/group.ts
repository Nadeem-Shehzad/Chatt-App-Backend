import { createGroup, addMemberToGroup, removeMemberFromGroup, sendMessageToGroup } from "../../controllers/group/group";


export const groupResolver = {
    Mutation: {
        createGroup: createGroup,
        addMemberToGroup: addMemberToGroup,
        removeMemberFromGroup: removeMemberFromGroup,
        sendMessageToGroup: sendMessageToGroup
    }
}

