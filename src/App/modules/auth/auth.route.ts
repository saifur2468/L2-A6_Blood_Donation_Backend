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

// এখানে সরাসরি AuthController.googleCallback ব্যবহার করা হলো যাতে রিডাইরেক্ট কাজ করে
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/api/v1/auth/oauth-failed',
  }),
  AuthController.googleCallback
);

export const AuthRoutes = router;