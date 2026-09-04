import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { AuthRoutes } from './App/modules/auth/auth.route.js';
import { UserRoutes } from './App/modules/user/user.route.js';
import { BloodRequestRoutes } from './App/modules/bloodRequest/bloodRequest.route.js';
import { PaymentRoutes } from './App/modules/payment/payment.route.js';

import globalErrorHandler from './App/middlewares/globalErrorHandler.js';
import { AdminRoutes } from './App/modules/admin/admin.route.js';

const app = express();

// Security
app.use(cors());
app.use(helmet());

// Stripe webhook MUST receive raw body
app.use(
  '/api/v1/payment/webhook',
  express.raw({
    type: 'application/json',
  })
);

// Normal body parser
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

// Routes
app.use('/api/v1/auth', AuthRoutes);

app.use('/api/v1/user', UserRoutes);

app.use(
  '/api/v1/blood-request',
  BloodRequestRoutes
);

app.use(
  '/api/v1/payment',
  PaymentRoutes
);
app.use(
  '/api/v1/admin',
  AdminRoutes
);
// Test
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Blood Donation API is running',
    data: null,
  });
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;