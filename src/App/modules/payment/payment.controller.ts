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

const getPaymentStatus = catchAsync(async (req: Request, res: Response) => {
  const { donationId } = req.params;

  const result = await PaymentService.getPaymentStatusFromDB(donationId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment status retrieved successfully',
    data: result,
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


const handlePaymentSuccess = catchAsync(async (req: Request, res: Response) => {
  const donationId = req.query.donation_id as string;

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment & Donation successful!',
    data: {
      donationId: donationId || null,
      status: 'PAID',
      receiptStatus: 'PDF generation and Cloudinary upload in progress',
    },
  });
});


const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;

  try {
    
    await PaymentService.handleStripeWebhookEvent(req.body, sig);
    res.status(200).json({ received: true });
  } catch (err: any) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

export const PaymentController = {
  createCheckoutSession,
  getPaymentStatus,
  getMyPaymentHistory,
  handlePaymentSuccess,
  handleStripeWebhook,
};