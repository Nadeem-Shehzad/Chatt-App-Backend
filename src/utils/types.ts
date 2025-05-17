import { CustomJwtPayload } from './customTypes'; 

declare global {
  namespace Express {
    interface Request {
      user?: CustomJwtPayload;
    }
  }
}