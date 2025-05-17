import { me, getUser } from '../../controllers/user/user_r';

export const resolvers = {
   Query: {
      me: me,
      getUser: getUser,
   }
}