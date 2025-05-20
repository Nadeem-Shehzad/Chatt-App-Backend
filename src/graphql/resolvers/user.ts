import {
   me,
   getUser,
   getUsers,
   searchUsers
} from '../../controllers/user/user_r';


export const userResolvers = {
   Query: {
      me: me,
      getUser: getUser,
      getUsers: getUsers,
      searchUser: searchUsers
   },

   // Mutation: {
      
   // }
}