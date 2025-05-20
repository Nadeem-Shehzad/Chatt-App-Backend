import { sendContactRequest, acceptContactRequest,blockContact } from "../../controllers/contact/contact_r"


export const contactResolver = {
  Mutation:{
    sendContactRequest,
    acceptContactRequest,
    blockContact
  }
}