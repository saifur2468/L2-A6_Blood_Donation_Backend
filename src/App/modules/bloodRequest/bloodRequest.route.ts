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

// ------------------- PATIENT ROUTES -------------------

// ১. পেশেন্ট রিকোয়েস্ট তৈরি করবে
router.post(
  '/',
  auth('PATIENT'),
  validateRequest(BloodRequestValidation.createBloodRequestSchema),
  BloodRequestController.createBloodRequest
);

// ২. পেশেন্ট তার নিজের রিকোয়েস্ট লিস্ট দেখবে
router.get(
  '/my-requests',
  auth('PATIENT'),
  BloodRequestController.getMyRequests
);

// ৩. পেশেন্ট রিকোয়েস্ট আপডেট করবে
router.patch(
  '/:id',
  auth('PATIENT'),
  validateRequest(BloodRequestValidation.updateBloodRequestSchema),
  BloodRequestController.updateMyRequest
);

// ৪. পেশেন্ট রিকোয়েস্ট ক্যানসেল/ডিলিট করবে
router.delete(
  '/:id',
  auth('PATIENT'),
  BloodRequestController.deleteMyRequest
);

// ------------------- DONOR ROUTES -------------------

// ৫. ডোনার সব পেন্ডিং রিকোয়েস্ট দেখবে
router.get(
  '/pending-requests',
  auth('DONOR'),
  BloodRequestController.getAllPendingRequests
);

// ৬. ডোনার রিকোয়েস্ট একসেপ্ট করবে
router.patch(
  '/:id/accept',
  auth('DONOR'),
  BloodRequestController.acceptBloodRequest
);

export const BloodRequestRoutes = router;