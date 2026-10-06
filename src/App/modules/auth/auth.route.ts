import express from 'express';
import validateRequest from '../../middlewares/validateRequest.js';
import { AuthValidation } from './auth.validation.js'; 
import { AuthController } from './auth.controller.js';
import passport from '../../../App/builder/config/passport.js';

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

router.get('/google', (req, res, next) => {
  const role = 'PATIENT'; 
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: JSON.stringify({ role }),
  })(req, res, next);
});


router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/api/v1/auth/oauth-failed',
  }),
  AuthController.googleCallback
);





router.post(
  '/forgot-password',
  validateRequest(AuthValidation.forgotPasswordValidationSchema),
  AuthController.forgotPassword
);

router.post(
  '/reset-password',
  validateRequest(AuthValidation.resetPasswordValidationSchema),
  AuthController.resetPassword
);



export const AuthRoutes = router;