import express from 'express';
import validateRequest from '../../middlewares/validateRequest.js';
import { AuthValidation } from './auth.validation.js'; 
import { AuthController } from './auth.controller.js';

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

export const AuthRoutes = router;