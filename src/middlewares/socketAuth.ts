import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { DecodedToken } from '../utils/customTypes';


export const socketAuth = (socket: Socket, next: (err?: Error) => void) => {

   const token = socket.handshake.auth?.token || socket.handshake.query?.token;

   if (!token) {
      return next(new Error('Authentication error: Token missing'));
   }

   try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
         return next(new Error('Authentication error: JWT secret not configured'));
      }

      const decoded = jwt.verify(token, jwtSecret) as DecodedToken;
      if (!decoded || !decoded.userId) {
         return next(new Error('Authentication error: Invalid token payload'));
      }

      (socket as any).userId = decoded.userId;
      next();

   } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
   }
};