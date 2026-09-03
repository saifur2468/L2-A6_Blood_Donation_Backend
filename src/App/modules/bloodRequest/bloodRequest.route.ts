// import express from 'express';
// import { auth } from '../../middlewares/auth.js';
// import validateRequest from '../../middlewares/validateRequest.js';
// import { BloodRequestValidation } from './bloodRequest.validation.js';
// import { BloodRequestController } from './bloodRequest.controller.js';

// const router = express.Router();


// router.post(
//   '/',
//   auth('PATIENT', 'ADMIN'),
//   validateRequest(BloodRequestValidation.createBloodRequestSchema),
//   BloodRequestController.createBloodRequest
// );


// router.get(
//   '/my-requests',
//   auth('PATIENT', 'ADMIN'),
//   BloodRequestController.getMyRequests
// );


// router.patch(
//   '/:id/cancel',
//   auth('PATIENT', 'ADMIN'),
//   BloodRequestController.cancelBloodRequest
// );


// router.patch(
//   '/:id/complete',
//   auth('PATIENT', 'ADMIN'),
//   BloodRequestController.completeBloodRequest
// );

// export const BloodRequestRoutes = router;

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

export const BloodRequestRoutes = router;