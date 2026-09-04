import express from 'express';
import auth from '../../middlewares/auth.js';
import { PaymentController } from './payment.controller.js';

const router = express.Router();

router.post(
  '/create-checkout',
  auth('PATIENT'),
  PaymentController.createCheckoutSession
);


router.get('/confirm', PaymentController.confirmPayment);
router.get('/cancel', PaymentController.cancelPayment);

router.get(
  '/my-history',
  auth('PATIENT'),
  PaymentController.getMyPaymentHistory
);

export const PaymentRoutes = router;