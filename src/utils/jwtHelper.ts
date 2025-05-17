import jwt from 'jsonwebtoken';
import { CustomJwtPayload } from './customTypes';

export const verifyToken = (authHeader?: string): CustomJwtPayload | null => {

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables.');
  }

    if (!authHeader) {
    return null;
  }

  // Ensure token starts with "Bearer "
  const formattedHeader = authHeader.startsWith('Bearer ')
    ? authHeader
    : `Bearer ${authHeader.trim()}`;

  // if (!authHeader || !authHeader.startsWith('Bearer ')) {
  //   return null;
  // }
  // const token = authHeader.slice(7).trim();
  
  const token = formattedHeader.slice(7).trim();
  
  try {
    const decoded = jwt.verify(token, secret) as CustomJwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};
