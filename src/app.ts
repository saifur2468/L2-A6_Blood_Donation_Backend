import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { AuthRoutes } from './App/modules/auth/auth.route.js'; 
import { UserRoutes } from './App/modules/user/user.route.js';
import globalErrorHandler from './App/middlewares/globalErrorHandler.js';
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

// Application Routes
app.use('/api/v1/auth', AuthRoutes);
app.use('/api/v1/user', UserRoutes);
app.use(globalErrorHandler);

// Test route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Blood Donation API is running',
    data: null,
  });
});

export default app;