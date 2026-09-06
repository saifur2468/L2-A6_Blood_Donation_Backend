import express from 'express';
import validateRequest from '../../middlewares/validateRequest.js';
import { AuthValidation } from './auth.validation.js'; 
import { AuthController } from './auth.controller.js';
// import passport from '../../../App/builder/config/passport.js';
// import jwt from 'jsonwebtoken';
const router = express.Router();

router.post(
  '/register',
  validateRequest(AuthValidation.registerValidationSchema), 
  AuthController.registerUser
);

router.post(
  '/login',
  validateRequest(AuthValidation.loginValidationSchema), 
  AuthController.loginUser
);

// router.get('/google', (req, res, next) => {
//   const role = (req.query.role as string) || 'PATIENT'; // Default role PATIENT or DONOR

//   passport.authenticate('google', {
//     scope: ['profile', 'email'],
//     session: false,
//     state: role, // Role-ti OAuth state-e pass kora hocche
//   })(req, res, next);
// });

// // 2. Google OAuth Callback Route
// router.get(
//   '/google/callback',
//   passport.authenticate('google', { failureRedirect: '/login', session: false }),
//   (req, res) => {
//     const user = req.user as any;

//     // JWT Token Generation
//     const token = jwt.sign(
//       { userId: user.id, role: user.role, email: user.email },
//       process.env.JWT_SECRET || 'secret_key',
//       { expiresIn: '7d' }
//     );

//     // Response with JSON Data & Token
//     res.status(200).json({
//       success: true,
//       statusCode: 200,
//       message: `Google Login successful as ${user.role}!`,
//       token: `Bearer ${token}`,
//       data: {
//         id: user.id,
//         fullName: user.fullName,
//         email: user.email,
//         role: user.role,
//         bloodGroup: user.bloodGroup || null,
//         district: user.district || null,
//       },
//     });
//   }
// );
export const AuthRoutes = router;


