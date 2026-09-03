// import type { NextFunction, Request, Response } from 'express';
// import jwt from 'jsonwebtoken';

// export interface CustomRequest extends Request {
//   user?: {
//     id: string;
//     email: string;
//     role: string;
//   };
// }

// export const auth = () => {
//   return async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const authHeader = req.headers.authorization;

//       if (!authHeader || !authHeader.startsWith('Bearer ')) {
//         res.status(401).json({
//           success: false,
//           statusCode: 401,
//           message: 'You are not authorized! Token missing.',
//         });
//         return;
//       }

      
//       const token = authHeader.split(' ')[1];

     
//       if (!token) {
//         res.status(401).json({
//           success: false,
//           statusCode: 401,
//           message: 'Invalid token format!',
//         });
//         return;
//       }

      
//       const decoded = jwt.verify(
//         token,
//         process.env.JWT_SECRET || 'secret_key'
//       ) as unknown as { id: string; email: string; role: string };

//       req.user = decoded;
//       next();
//     } catch (error) {
//       res.status(401).json({
//         success: false,
//         statusCode: 401,
//         message: 'Invalid or expired token!',
//       });
//     }
//   };
// };





































import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const auth = (...requiredRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;

      if (!token) {
        throw new Error('You are not authorized!');
      }

      // JWT টোকেন ভেরিফাই করা
      const decoded = jwt.verify(
        token.replace('Bearer ', ''),
        process.env.JWT_SECRET || 'secret'
      ) as JwtPayload;

      const { role } = decoded;

      // 🔒 রোল পারমিশন চেক করা
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