import User from "../../models/user";
import { MyContext, IUser } from "../../utils/customTypes";


export const me = async (_: any, __: any, context: MyContext): Promise<IUser> => {
   const { userId } = context;

   if (!userId) {
      throw new Error('Not Authenticated!');
   }

   const user = await User.findById(userId).select('-password');
   if (!user) {
      throw new Error('User not Found!');
   }

   return user;
};

export const getUser = () => "Hello from Chatt-App GraphQL APIS!";