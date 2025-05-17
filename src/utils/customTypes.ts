import { JwtPayload } from 'jsonwebtoken';
import { Document } from 'mongoose';

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
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