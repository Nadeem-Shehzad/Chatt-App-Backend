import {
   me,
   getUser,
   getUsers,
   searchUsers,
   addContact,
   getContacts
} from '../../controllers/user/user_r';


export const resolvers = {
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