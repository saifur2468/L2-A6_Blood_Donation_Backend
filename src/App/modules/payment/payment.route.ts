// import express from 'express';
// import auth from '../../middlewares/auth.js';
// import { PaymentController } from './payment.controller.js';

// const router = express.Router();

// router.post(
//   '/create-checkout',
//   auth('PATIENT'),
//   PaymentController.createCheckoutSession
// );


// router.get('/confirm', PaymentController.confirmPayment);
// router.get('/cancel', PaymentController.cancelPayment);

// router.get(
//   '/my-history',
//   auth('PATIENT'),
//   PaymentController.getMyPaymentHistory
// );

// export const PaymentRoutes = router;








import express from 'express';
import auth from '../../middlewares/auth.js';
import { PaymentController } from './payment.controller.js';

const router = express.Router();

// 🟢 NEW: Stripe Success Callback Route (Public - authentication ছাড়া)
router.get('/success', PaymentController.handlePaymentSuccess);

// 🟢 NEW: Stripe Webhook Listener Route (MUST use raw body for signature verify)
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  PaymentController.handleStripeWebhook
);

router.post(
  '/create-checkout',
  auth('PATIENT'),
  PaymentController.createCheckoutSession
);

router.get(
  '/status/:donationId',
  auth('PATIENT'),
  PaymentController.getPaymentStatus
);

router.get(
  '/my-history',
  auth('PATIENT'),
  PaymentController.getMyPaymentHistory
);

export const PaymentRoutes = router;