import { JwtPayload } from 'jsonwebtoken';
import { Document, Types } from 'mongoose';


export interface IUser extends Document {
   username: string;
   email: string;
   password: string;
   token?: string;
   contacts: Types.ObjectId[];
}

export interface MyContext {
   userId?: string;
   email?: string;
}

export interface CustomJwtPayload extends JwtPayload {
   userId: string;
   email: string;
   iat?: number;
   exp?: number;
}

export interface AuthResponse {
   success: boolean;
   message: string;
   data: IUser | null
}

export interface SingleUserResponse {
   success: boolean;
   message: string;
   data: IUser | null
}

export interface AllUsersResponse {
   success: boolean;
   message: string;
   data: IUser[] | null
}


// messages 
export interface IMessage extends Document {
   _id: Types.ObjectId;
   sender: Types.ObjectId;
   receiver: Types.ObjectId;
   content: string;
   delivered: Boolean;
   createdAt: Date;
   updatedAt: Date;
}

export interface IMessageDTO {
   _id: Types.ObjectId;
   sender: Types.ObjectId;
   receiver: Types.ObjectId;
   content: string;
   delivered: boolean;
   createdAt: Date;
   updatedAt: Date;
}

export interface MessageResponse {
   success: boolean;
   message: string;
   data: IMessageDTO | null
}

export interface MessagesResponse {
   success: boolean;
   message: string;
   data: IMessageDTO[] | null
}

export interface IUserSummary {
   _id: Types.ObjectId;
   username: string;
}

export interface ChatSummary {
   user: IUserSummary;
   lastMessage: string;
   time: string; // ISO string from createdAt
}

export interface AllChatsResponse {
   success: boolean;
   message: string;
   data: ChatSummary[] | null
}




export interface DecodedToken {
   userId: string;
}


// contacts
export interface IContact extends Document {
   id: Types.ObjectId;
   requester: Types.ObjectId;
   receiver: Types.ObjectId;
   status: 'pending' | 'accepted' | 'blocked'
}

export interface ContactResponse {
   success: boolean;
   message: string;
   data: IContact | null
}


export interface IContactUser extends Document {
   _id: Types.ObjectId;
   username: string;
   email: string
}

export interface NContact {
   _id: Types.ObjectId;
   user: IContactUser;
   status: 'pending' | 'accepted' | 'blocked';
}

export interface ContactsResponse {
   success: boolean;
   message: string;
   data: NContact[] | null
}


export interface IOnlineUser {
   _id: Types.ObjectId;
   username: string;
}

export interface OnlineUsersResponse {
   success: boolean;
   message: string;
   data: IOnlineUser[] | null
}


//group Types
export interface IGroup extends Document {
   name: string;
   creator: Types.ObjectId;
   description: string;
   members: Types.ObjectId[],
   createdAt: Date,
   updatedAt: Date
}

export interface GroupResponse {
   success: boolean;
   message: string;
   data: IGroup | null
}

export interface IGroupMessage extends Document {
   _id: Types.ObjectId;
   groupId: Types.ObjectId;
   senderId: Types.ObjectId;
   content: string;
   createdAt: Date,
   updatedAt: Date
}

export interface GroupMessageResponse {
   success: boolean;
   message: string;
   data: IGroupMessage | null
}