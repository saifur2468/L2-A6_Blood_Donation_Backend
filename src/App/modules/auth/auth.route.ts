// import express from 'express';
// import validateRequest from '../../middlewares/validateRequest.js';
// import { AuthController } from './auth.controller.js';
// import { registerValidationSchema } from './auth.validation.js';

// const router = express.Router();

// router.post(
//   '/register',
//   validateRequest(registerValidationSchema),
//   AuthController.registerUser 
// );

// router.post('/login', AuthController.loginUser);
// router.post('/google-login', AuthController.googleLogin);

// export const AuthRoutes = router;


















import express from 'express';
import validateRequest from '../../middlewares/validateRequest.js';
import { AuthValidation } from './auth.validation.js'; // 👈 এভাবে ইমপোর্ট করুন
import { AuthController } from './auth.controller.js';

const router = express.Router();

router.post(
  '/register',
  validateRequest(AuthValidation.registerValidationSchema), // 👈 AuthValidation ব্যবহার করুন
  AuthController.registerUser
);

router.post(
  '/login',
  validateRequest(AuthValidation.loginValidationSchema), // 👈 AuthValidation ব্যবহার করুন
  AuthController.loginUser
);

export const AuthRoutes = router;