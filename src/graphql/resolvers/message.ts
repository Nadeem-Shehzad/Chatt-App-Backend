import { sendMessage, getMessages } from "../../controllers/message/message_r"


export const messageResolvers = {
    Query: {
        getMessages: getMessages
    },

    Mutation: {
        sendMessage: sendMessage
    }
}