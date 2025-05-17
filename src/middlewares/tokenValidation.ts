import { IncomingMessage } from 'http';
import { Request } from 'express';
import { verifyToken } from '../utils/jwtHelper';
import { MyContext } from '../utils/customTypes';

export const tokenValidation = async ({ req }: { req: IncomingMessage }): Promise<MyContext> => {
  const expressReq = req as Request;
  const decoded = verifyToken(expressReq.headers.authorization);

  if (decoded) {
    return {
      userId: decoded.userId,
      email: decoded.email,
    };
  }

  return {}; // No token or invalid token
};
