import {
    sendMessage,
    getMessages,
    getAllChats,
    deleteMessage
} from "../../controllers/message/message_r"


export const messageResolvers = {
    Query: {
        getMessages: getMessages,
        getAllChats: getAllChats
    },

    Mutation: {
        sendMessage: sendMessage,
        deleteMessage: deleteMessage
    }
}