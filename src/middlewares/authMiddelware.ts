import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwtHelper';


export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
   const authHeader = req.headers.authorization;

   // If token is not provided
   if (!authHeader) {
      res.status(401).json({
         success: false,
         message: 'Unauthorized access. Token is missing.',
         data: null
      });
      return;
   }

   const decoded = verifyToken(authHeader);

   if (!decoded) {
      res.status(401).json({ success: false, message: 'Unauthorized access. Invalid or missing token.', data: null });
      return; // Important: Stop further execution
   }
   
   req.user = decoded; // Available because of `types.ts` extension
   
   next();
};