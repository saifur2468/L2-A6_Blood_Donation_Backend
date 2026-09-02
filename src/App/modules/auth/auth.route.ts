// import express from 'express';
// import validateRequest from '../../middlewares/validateRequest.js';
// import { AuthController } from './auth.controller.js';
// import { registerValidationSchema } from './auth.validation.js';

// const router = express.Router();

// router.post(
//   '/register',
//   validateRequest(registerValidationSchema), 
// );
// router.post('/login', AuthController.loginUser);
// router.post('/google-login', AuthController.googleLogin);

// export const AuthRoutes = router;

import express from 'express';
import validateRequest from '../../middlewares/validateRequest.js';
import { AuthController } from './auth.controller.js';
import { registerValidationSchema } from './auth.validation.js';

const router = express.Router();

router.post(
  '/register',
  validateRequest(registerValidationSchema),
  AuthController.registerUser // <-- এই কন্ট্রোলার হ্যান্ডলারটি যুক্ত করুন
);

router.post('/login', AuthController.loginUser);
router.post('/google-login', AuthController.googleLogin);

export const AuthRoutes = router;