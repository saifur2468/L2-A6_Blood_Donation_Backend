import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync.js'; // আপনার প্রজেক্টের catchAsync অনুযায়ী পাথ অ্যাডজাস্ট করুন
import sendResponse from '../../utils/sendresponse.js'; // আপনার প্রজেক্টের sendResponse অনুযায়ী পাথ অ্যাডজাস্ট করুন
import { PaymentService } from './payment.service.js';

// ১. Checkout Session তৈরি করা
const createCheckoutSession = catchAsync(async (req: Request, res: Response) => {
  const patientId = req.user.id; // অথেন্টিকেশন মিডলওয়্যার থেকে পাওয়া User ID
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

// ২. Direct Payment Confirmation
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

// ৩. Payment Cancelled Handler
const cancelPayment = catchAsync(async (req: Request, res: Response) => {
  sendResponse(res, {
    statusCode: 200,
    success: false,
    message: 'Payment was cancelled by the user.',
    data: null,
  });
});

// ৪. Payment History
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