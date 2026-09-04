import express from 'express';
import auth from '../../middlewares/auth.js';
import { AdminController } from './admin.controller.js';

const router = express.Router();


router.get('/users', auth('ADMIN'), AdminController.getAllUsers);
router.patch('/users/:userId/block', auth('ADMIN'), AdminController.toggleUserBlockStatus);
router.patch('/users/:userId/role', auth('ADMIN'), AdminController.updateUserRole);

router.patch('/blood-requests/:requestId/status', auth('ADMIN'), AdminController.updateBloodRequestStatus);

router.get('/reports', auth('ADMIN'), AdminController.getSystemReport);
router.get('/audit-logs', auth('ADMIN'), AdminController.getAuditLogs);

export const AdminRoutes = router;