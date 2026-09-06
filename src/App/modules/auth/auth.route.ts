// import express from 'express';
// import validateRequest from '../../middlewares/validateRequest.js';
// import { AuthValidation } from './auth.validation.js'; 
// import { AuthController } from './auth.controller.js';
// // import passport from '../../../App/builder/config/passport.js';
// // import jwt from 'jsonwebtoken';
// const router = express.Router();

// router.post(
//   '/register',
//   validateRequest(AuthValidation.registerValidationSchema), 
//   AuthController.registerUser
// );

// router.post(
//   '/login',
//   validateRequest(AuthValidation.loginValidationSchema), 
//   AuthController.loginUser
// );






// export const AuthRoutes = router;


















// auth.route.ts
import express from 'express';
import passport from '../../builder/config/passport.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// 1. Google Auth Route (কোথা থেকে রোল আসছে তা ক্যাচ করে State এ পাস করা)
router.get('/google', (req, res, next) => {
  const role = (req.query.role as string) || 'PATIENT'; // ডিফল্ট PATIENT, তবে কাস্টম রোল দেওয়া যাবে
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: JSON.stringify({ role }), // state-এর ভেতরে রোল পাঠানো হচ্ছে
  })(req, res, next);
});

// 2. Callback Route (State থেকে রোল রিড করে ডাটাবেজ ক্রিয়েট করা)
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/api/v1/auth/oauth-failed' }),
  (req, res) => {
    const user = req.user as any;

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_ACCESS_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    const { password, ...userData } = user;

    res.status(200).json({
      success: true,
      message: `Google Login Successful as ${user.role}!`,
      data: {
        accessToken,
        user: userData,
      },
    });
  }
);
export const AuthRoutes = router;