import express from 'express';
import { UserController } from './user.controller.js'; 
import { auth } from '../../middlewares/auth.js';    

const router = express.Router();

// GET My Profile (Protected Route)
router.get('/me', auth(), UserController.getMyProfile);

export const UserRoutes = router;