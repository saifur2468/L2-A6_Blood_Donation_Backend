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

// import express from 'express';
// import auth from '../../middlewares/auth.js';
// import validateRequest from '../../middlewares/validateRequest.js';
// import { BloodRequestValidation } from './bloodRequest.validation.js';
// import { BloodRequestController } from './bloodRequest.controller.js';

// const router = express.Router();


// router.post(
//   '/',
//   auth('PATIENT'),
//   validateRequest(BloodRequestValidation.createBloodRequestSchema),
//   BloodRequestController.createBloodRequest
// );


// router.get(
//   '/my-requests',
//   auth('PATIENT'),
//   BloodRequestController.getMyRequests
// );

// export const BloodRequestRoutes = router;



import express from 'express';
import auth from '../../middlewares/auth.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { BloodRequestValidation } from './bloodRequest.validation.js';
import { BloodRequestController } from './bloodRequest.controller.js';

const router = express.Router();

// ১. রিকোয়েস্ট তৈরি (PATIENT Only)
router.post(
  '/',
  auth('PATIENT'),
  validateRequest(BloodRequestValidation.createBloodRequestSchema),
  BloodRequestController.createBloodRequest
);

// ২. পেশেন্ট তার নিজের তৈরি করা রিকোয়েস্ট লিস্ট দেখবে (PATIENT Only)
router.get(
  '/my-requests',
  auth('PATIENT'),
  BloodRequestController.getMyRequests
);

// ৩. পেশেন্ট তার রিকোয়েস্ট আপডেট করবে (PATIENT Only)
router.patch(
  '/:id',
  auth('PATIENT'),
  validateRequest(BloodRequestValidation.updateBloodRequestSchema),
  BloodRequestController.updateMyRequest
);

// ৪. পেশেন্ট তার রিকোয়েস্ট ক্যানসেল করবে (PATIENT Only)
router.delete(
  '/:id',
  auth('PATIENT'),
  BloodRequestController.deleteMyRequest
);

export const BloodRequestRoutes = router;