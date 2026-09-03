import express from 'express';
import { UserController } from './user.controller.js';
import  auth  from '../../middlewares/auth.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { UserValidation } from './user.validation.js';

const router = express.Router();


router.get('/donors', UserController.getAllDonors);


router.get('/me', auth(), UserController.getMyProfile);
router.patch(
  '/me',
  auth(),
  validateRequest(UserValidation.updateProfileValidationSchema),
  UserController.updateMyProfile
);

export const UserRoutes = router;