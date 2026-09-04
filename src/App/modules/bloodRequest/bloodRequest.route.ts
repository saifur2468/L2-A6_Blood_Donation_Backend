import express from 'express';
import auth from '../../middlewares/auth.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { BloodRequestValidation } from './bloodRequest.validation.js';
import { BloodRequestController } from './bloodRequest.controller.js';

const router = express.Router();




router.post(
  '/',
  auth('PATIENT'),
  validateRequest(BloodRequestValidation.createBloodRequestSchema),
  BloodRequestController.createBloodRequest
);


router.get(
  '/my-requests',
  auth('PATIENT'),
  BloodRequestController.getMyRequests
);


router.patch(
  '/:id',
  auth('PATIENT'),
  validateRequest(BloodRequestValidation.updateBloodRequestSchema),
  BloodRequestController.updateMyRequest
);


router.delete(
  '/:id',
  auth('PATIENT'),
  BloodRequestController.deleteMyRequest
);


router.get(
  '/pending-requests',
  auth('DONOR'),
  BloodRequestController.getAllPendingRequests
);


router.patch(
  '/:id/accept',
  auth('DONOR'),
  BloodRequestController.acceptBloodRequest
);

export const BloodRequestRoutes = router;