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
import { AuthController } from './auth.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { loginValidationSchema, registerValidationSchema } from './auth.validation.js';

const router = express.Router();

// Register Route
router.post(
  '/register',
  validateRequest(registerValidationSchema),
  AuthController.registerUser
);

// Login Route
router.post(
  '/login',
  validateRequest(loginValidationSchema),
  AuthController.loginUser
);


router.post('/logout', AuthController.logoutUser);

export const AuthRoutes = router;