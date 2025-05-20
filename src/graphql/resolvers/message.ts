import { sendMessage } from "../../controllers/message/message_r"


export const messageResolvers = {
    Query:{

    },
    
    Mutation:{
        sendMessage: sendMessage
    }
}