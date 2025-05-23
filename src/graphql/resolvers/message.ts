import {
    sendMessage,
    getMessages,
    getAllChats,
    markMessagesAsSeen,
    deleteMessage
} from "../../controllers/message/message_r"


export const messageResolvers = {
    Query: {
        getMessages: getMessages,
        getAllChats: getAllChats
    },

    Mutation: {
        sendMessage: sendMessage,
        markMessagesAsSeen: markMessagesAsSeen,
        deleteMessage: deleteMessage
    }
}