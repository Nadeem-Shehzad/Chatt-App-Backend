import {
   me,
   getUser,
   getUsers,
   searchUsers,
   addContact,
   getContacts
} from '../../controllers/user/user_r';


export const userResolvers = {
   Query: {
      me: me,
      getUser: getUser,
      getUsers: getUsers,
      searchUser: searchUsers,
      getContacts: getContacts
   },

   Mutation: {
      addContact: addContact
   }
}