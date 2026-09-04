import Stripe from 'stripe';

import  prisma  from '../../../lib/prisma.js'; 

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});


const createCheckoutSessionInStripe = async (
  patientId: string,
  donationId: string,
  amount: number
) => {
  const donation = await prisma.donationRecord.findUnique({
    where: { id: donationId },
    include: { request: true },
  });

  if (!donation) {
    throw new Error('Donation record not found!');
  }

  if (donation.request.patientId !== patientId) {
    throw new Error('You are not authorized to pay for this request!');
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Blood Donation Support Payment',
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
   
    success_url: `http://localhost:5000/api/v1/payment/confirm?session_id={CHECKOUT_SESSION_ID}&donation_id=${donationId}`,
    cancel_url: `http://localhost:5000/api/v1/payment/cancel`,
  });

  return {
    sessionId: session.id,
    paymentUrl: session.url,
  };
};


const confirmPaymentInDB = async (sessionId: string, donationId: string) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status === 'paid') {
    const updatedDonation = await prisma.donationRecord.update({
      where: { id: donationId },
      data: {
        paymentStatus: 'PAID',
      },
    });

    return updatedDonation;
  } else {
    throw new Error('Payment was not completed successfully.');
  }
};


const getMyPaymentHistoryFromDB = async (patientId: string) => {
  const result = await prisma.donationRecord.findMany({
    where: {
      request: {
        patientId,
      },
    },
    include: {
      request: {
        select: {
          bloodGroup: true,
          hospitalName: true,
          bagsNeeded: true,
        },
      },
      donor: {
        select: {
          fullName: true,
          phoneNumber: true,
          email: true,
        },
      },
    },
    orderBy: {
      donatedAt: 'desc',
    },
  });

  return result;
};

export const PaymentService = {
  createCheckoutSessionInStripe,
  confirmPaymentInDB,
  getMyPaymentHistoryFromDB,
};