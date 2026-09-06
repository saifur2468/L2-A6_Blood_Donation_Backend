import { Request, Response } from 'express';
import Stripe from 'stripe';
import prisma from '../../../lib/prisma.js';
import { generateReceiptPdfBuffer } from '../../utils/generateReceiptPdf.js';
import { uploadPdfBufferToCloudinary } from '../../utils/uploadPdfToCloudinary.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export const paymentWebhookHandler = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
   
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      await handleCheckoutCompleted(session);
    } catch (err) {
      console.error('Error handling checkout.session.completed:', err);
     
      return res.status(500).json({ received: false });
    }
  }


  res.status(200).json({ received: true });
};

const handleCheckoutCompleted = async (session: Stripe.Checkout.Session) => {
  const donationId = session.metadata?.donationId;

  if (!donationId) {
    console.error('No donationId found in session metadata');
    return;
  }

  
  const existing = await prisma.donationRecord.findUnique({
    where: { id: donationId },
  });

  if (!existing) {
    console.error(`Donation record not found for id: ${donationId}`);
    return;
  }

  if (existing.paymentStatus === 'PAID' && existing.receiptUrl) {
    console.log(`Donation ${donationId} already processed, skipping.`);
    return;
  }

  if (session.payment_status !== 'paid') {
    console.log(`Session ${session.id} not paid yet, status: ${session.payment_status}`);
    return;
  }

  const donation = await prisma.donationRecord.findUnique({
    where: { id: donationId },
    include: {
      request: {
        select: {
          bloodGroup: true,
          hospitalName: true,
          patient: { select: { fullName: true } },
        },
      },
    },
  });

  if (!donation) return;

  const amount = (session.amount_total ?? 0) / 100;

  e
  const pdfBuffer = await generateReceiptPdfBuffer({
    donationId,
    patientName: donation.request?.patient?.fullName,
    amount,
    currency: session.currency ?? 'usd',
    sessionId: session.id,
    paidAt: new Date(),
    bloodGroup: donation.request?.bloodGroup,
    hospitalName: donation.request?.hospitalName,
  });

  
  const receiptUrl = await uploadPdfBufferToCloudinary(
    pdfBuffer,
    `receipt-${donationId}-${Date.now()}`
  );

 
  await prisma.donationRecord.update({
    where: { id: donationId },
    data: {
      paymentStatus: 'PAID',
      receiptUrl,
      stripeSessionId: session.id,
    },
  });

  console.log(` Payment confirmed & receipt generated for donation ${donationId}`);
};