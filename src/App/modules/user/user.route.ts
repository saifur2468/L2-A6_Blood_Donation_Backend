import express from 'express';
import { UserController } from './user.controller.js';
import  auth  from '../../middlewares/auth.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { UserValidation } from './user.validation.js';
import { upload}  from '../../../App/builder/config/cloudinary.config.js';
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

export const UserRoutes = router;