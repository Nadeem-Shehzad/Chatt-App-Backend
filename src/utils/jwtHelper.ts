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

  const formattedHeader = authHeader.startsWith('Bearer ')
    ? authHeader
    : `Bearer ${authHeader.trim()}`;

  const token = formattedHeader.slice(7).trim();

  try {
    const decoded = jwt.verify(token, secret) as CustomJwtPayload;
    return decoded;
    
  } catch (error) {
    return null;
  }
};
