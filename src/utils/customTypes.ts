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
    id: Types.ObjectId;
    sender: Types.ObjectId;
    receiver: Types.ObjectId;
    content: string;
    delivered: Boolean;
}

export interface IMessageDTO {
  id: Types.ObjectId;
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  content: string;
  delivered: boolean;
}

export interface MessageResponse {
    success: boolean;
    message: string;
    data: IMessageDTO  | null
}

export interface DecodedToken {
  userId: string;
}