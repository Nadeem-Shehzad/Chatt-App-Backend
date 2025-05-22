import {
  sendContactRequest,
  acceptContactRequest,
  blockContact,
  getContacts,
  getOnlineUsers
} from "../../controllers/contact/contact_r"


export const contactResolver = {
  Query: {
    getContacts: getContacts,
    getOnlineUsers: getOnlineUsers
  },

  Mutation: {
    sendContactRequest,
    acceptContactRequest,
    blockContact
  }
}