// import { NextFunction, Request, Response } from 'express';
// import jwt, { JwtPayload } from 'jsonwebtoken';

// const auth = (...requiredRoles: string[]) => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const token = req.headers.authorization;

//       if (!token) {
//         throw new Error('You are not authorized!');
//       }
// const decoded = jwt.verify(
//         token.replace('Bearer ', ''),
//         process.env.JWT_SECRET || 'secret'
//       ) as JwtPayload;

//       const { role } = decoded;

     
//       if (requiredRoles.length && !requiredRoles.includes(role)) {
//         throw new Error('You are not authorized to perform this action!');
//       }

//       req.user = decoded;
//       next();
//     } catch (err) {
//       next(err);
//     }
//   };
// };

// export default auth;


















import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import AppError from '../errors/AppError.js';

const auth = (...requiredRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;

  
      if (!token) {
        throw new AppError(401, 'You are not authorized! Token is missing.');
      }

 
      const tokenString = token.startsWith('Bearer ')
        ? token.split(' ')[1]
        : token;

   
      let decoded: JwtPayload;
      try {
        decoded = jwt.verify(
          tokenString,
          process.env.JWT_ACCESS_SECRET || 'secret'
        ) as JwtPayload;
      } catch (error) {
        throw new AppError(401, 'Unauthorized! Invalid or expired token.');
      }

      const { role } = decoded;

     
      if (requiredRoles.length && !requiredRoles.includes(role)) {
        throw new AppError(
          403,
          'Forbidden! You are not authorized to perform this action.'
        );
      }

    
      req.user = decoded;
      next();
    } catch (err) {
      next(err);
    }
  };
};

export default auth;