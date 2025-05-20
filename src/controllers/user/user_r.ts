import mongoose from "mongoose";
import User from "../../models/user";
import { MyContext, IUser, SingleUserResponse, AllUsersResponse } from "../../utils/customTypes";


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


export const getUser = async (_: any, { id }: { id: string }): Promise<SingleUserResponse> => {

   const user = await User.findById(id);

   if (!user) {
      return { success: false, message: 'User not Found!', data: null };
   }

   return { success: true, message: 'User Detail', data: user };
};


export const getUsers = async (): Promise<AllUsersResponse> => {
   const users = await User.find({});

   return { success: true, message: 'All Users', data: users };
};


export const searchUsers = async (_: any, { name }: { name: string }): Promise<AllUsersResponse> => {
   const users = await User.find({
      username: { $regex: name, $options: 'i' }
   });

   return { success: true, message: 'Matched Users', data: users };
};


// export const getContacts = async (_: any, __:any, context: MyContext): Promise<AllUsersResponse> => {

//    const user = await User.findById(context.userId).populate<{ contacts: IUser[] }>('contacts', 'username email').lean();

//    if(!user){
//       return { success: false, message: 'User not Found!', data: null };
//    }

//    return { success: true, message: 'All Users', data: user.contacts as IUser[] };
// };