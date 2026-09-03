import express from 'express';
import { auth } from '../middlewares/auth.js';
import { DonationRequestController } from '../modules/donationRequest/donationRequest.controller.js';
import { PaymentController } from '../modules/payment/payment.controller.js';

const router = express.Router();


router.post(
  '/donation-request',
  auth('RECIPIENT', 'ADMIN'),
  DonationRequestController.createDonationRequest
);

router.get(
  '/donation-request/my-requests',
  auth('RECIPIENT', 'ADMIN'),
  DonationRequestController.getMyRequests
);

router.patch(
  '/donation-request/:id/cancel',
  auth('RECIPIENT', 'ADMIN'),
  DonationRequestController.cancelRequest
);

router.patch(
  '/donation-request/:id/complete',
  auth('RECIPIENT', 'ADMIN'),
  DonationRequestController.completeRequest
);


router.post(
  '/payments/stripe/initiate',
  auth('RECIPIENT', 'ADMIN'),
  PaymentController.initiateStripePayment
);

router.post(
  '/payments/stripe/verify',
  auth('RECIPIENT', 'ADMIN'),
  PaymentController.verifyStripePayment
);

router.get(
  '/payments/my-payments',
  auth('RECIPIENT', 'ADMIN'),
  PaymentController.getMyPayments
);

export const AppRoutes = router;