import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const auth = (...requiredRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;

      if (!token) {
        throw new Error('You are not authorized!');
      }
const decoded = jwt.verify(
        token.replace('Bearer ', ''),
        process.env.JWT_SECRET || 'secret'
      ) as JwtPayload;

      const { role } = decoded;

     
      if (requiredRoles.length && !requiredRoles.includes(role)) {
        throw new Error('You are not authorized to perform this action!');
      }

      req.user = decoded;
      next();
    } catch (err) {
      next(err);
    }
  };
};

export default auth;