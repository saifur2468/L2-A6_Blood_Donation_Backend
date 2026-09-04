import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendresponse.js';
import { PaymentService } from './payment.service.js';

const createCheckoutSession = catchAsync(async (req: Request, res: Response) => {
  const patientId = req.user.id;
  const { donationId, amount } = req.body;

  const result = await PaymentService.createCheckoutSessionInStripe(
    patientId,
    donationId,
    amount
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Checkout session created successfully',
    data: result,
  });
});

const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  const { session_id, donation_id } = req.query;

  const result = await PaymentService.confirmPaymentInDB(
    session_id as string,
    donation_id as string
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment confirmed successfully!',
    data: result,
  });
});

const cancelPayment = catchAsync(async (req: Request, res: Response) => {
  sendResponse(res, {
    statusCode: 200,
    success: false,
    message: 'Payment was cancelled by the user.',
    data: null,
  });
});

const getMyPaymentHistory = catchAsync(async (req: Request, res: Response) => {
  const patientId = req.user.id;

  const result = await PaymentService.getMyPaymentHistoryFromDB(patientId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment history retrieved successfully',
    data: result,
  });
});

export const PaymentController = {
  createCheckoutSession,
  confirmPayment,
  cancelPayment,
  getMyPaymentHistory,
};