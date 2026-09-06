import express from 'express';
import { UserController } from './user.controller.js';
import  auth  from '../../middlewares/auth.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { UserValidation } from './user.validation.js';
import { upload}  from '../../../App/builder/config/cloudinary.config.js';
import AppError from '../../errors/AppError.js';
const router = express.Router();


router.get('/donors', UserController.getAllDonors);


router.get('/me', auth(), UserController.getMyProfile);
router.patch(
  '/me',
  auth(),
  validateRequest(UserValidation.updateProfileValidationSchema),
  UserController.updateMyProfile
);
router.patch(
  '/update-profile',
  auth('PATIENT', 'DONOR', 'ADMIN'),
  upload.single('file'), 
  UserController.updateProfile
);


router.get('/test-error', (req, res, next) => {
  throw new AppError(404, 'User not found testing AppError!');
});
export const UserRoutes = router;



// import express from 'express';
// import { updateMyProfile,getMyProfile } from './user.controller.js';
// import auth from '../../middlewares/auth.js'; // Named import/Default import চেক করে নিন

// const router = express.Router();

// // 1. PATCH http://localhost:5000/api/v1/user/me
// router.patch(
//   '/me',
//   auth('PATIENT', 'DONOR', 'ADMIN'),
//   updateMyProfile
// );
// router.get(
//   '/me',
//   auth('PATIENT', 'DONOR', 'ADMIN'),
//   getMyProfile
// );

// export const UserRoutes = router;