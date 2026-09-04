import express from 'express';
import auth from '../../middlewares/auth'; // আপনার প্রজেক্টের auth middleware অনুযায়ী পাথ দিন
import { PaymentController } from './payment.controller';

const router = express.Router();

// ১. Create Checkout Session Route (Patient Protected)
router.post(
  '/create-checkout',
  auth('PATIENT'),
  PaymentController.createCheckoutSession
);

// ২. Direct Confirm Payment Route (Public / Redirected by Stripe)
router.get('/confirm', PaymentController.confirmPayment);

// ৩. Cancel Payment Route
router.get('/cancel', PaymentController.cancelPayment);

// ৪. Get My Payment History Route (Patient Protected)
router.get(
  '/my-history',
  auth('PATIENT'),
  PaymentController.getMyPaymentHistory
);

export const PaymentRoutes = router;