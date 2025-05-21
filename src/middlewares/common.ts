import User from "../models/user";
import { MyContext } from "../utils/customTypes";


export const compose = (...middleware: Function[]) => {
   return middleware.reduce((a, b) => (args: any) => a(b(args)));
}

export const isAuthenticated = (resolverFunction: Function) => {
   return async (parent: any, args: any, context: MyContext, info: any) => {
      if (!context.userId) {
         throw new Error('Authentication Required!');
      }

      return resolverFunction(parent, args, context, info);
   }
}

export const ErrorHandling = (resolverFunction: Function) => {
   return async (parent: any, args: any, context: MyContext, info: any) => {
      try {
         return await resolverFunction(parent, args, context, info);
      } catch (error: unknown) {
         if (error instanceof Error) {
            return { success: false, message: error.message, data: null };
         } else {
            console.error("Unexpected error:", error);
            return { success: false, message: 'Server error!', data: null };
         }
      }
   };
}

export const checkContent = (resolverFunction: Function) => {
   return async (parent: any, args: any, context: MyContext, info: any) => {
      if (!args.content || !args.content.trim()) {
         return {
            success: false,
            message: 'Message content is empty',
            data: null,
         };
      }
      return resolverFunction(parent, args, context, info);
   }
}

export const checkReceiver = (resolverFunction: Function) => {
   return async (parent: any, args: any, context: MyContext, info: any) => {

      const receiverExists = await User.findById(args.receiverId);
      if (!receiverExists) {
         return { success: false, message: 'Receiver not found', data: null };
      }

      return resolverFunction(parent, args, context, info);
   }
} 