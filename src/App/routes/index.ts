import express from 'express';
import { auth } from '../middlewares/auth.js';
import { DonationRequestController } from '../modules/donationRequest/donationRequest.controller.js';
import { PaymentController } from '../modules/payment/payment.controller.js';
import { UserRoutes } from '../modules/user/user.route.js'; 

const router = express.Router();

router.use('/user', UserRoutes);

router.post(
  '/donation-request',
  auth('PATIENT', 'DONOR', 'ADMIN'), 
  DonationRequestController.createDonationRequest
);

router.get(
  '/donation-request/my-requests',
  auth('PATIENT', 'DONOR', 'ADMIN'),
  DonationRequestController.getMyRequests
);

router.patch(
  '/donation-request/:id/cancel',
  auth('PATIENT', 'ADMIN'),
  DonationRequestController.cancelRequest
);

router.patch(
  '/donation-request/:id/complete',
  auth('PATIENT', 'ADMIN'),
  DonationRequestController.completeRequest
);


router.post(
  '/payments/stripe/initiate',
  auth('PATIENT', 'ADMIN'),
  PaymentController.initiateStripePayment
);

router.post(
  '/payments/stripe/verify',
  auth('PATIENT', 'ADMIN'),
  PaymentController.verifyStripePayment
);

router.get(
  '/payments/my-payments',
  auth('PATIENT', 'ADMIN'),
  PaymentController.getMyPayments
);

export const AppRoutes = router;