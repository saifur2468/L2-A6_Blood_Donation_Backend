import Stripe from 'stripe';
import { PrismaClient } from '../../../../prisma/generated/prisma/index.js'; // 👈 index.js যুক্ত করুন
const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16', // আপনার ইনস্টল করা স্টালিন/স্ট্রাইপ ভার্সন
});

// ১. Stripe Checkout Session তৈরি করা
const createCheckoutSessionInStripe = async (
  patientId: string,
  donationId: string,
  amount: number
) => {
  // Donation Record খুঁজে বের করা এবং অথরাইজেশন চেক করা
  const donation = await prisma.donationRecord.findUnique({
    where: { id: donationId },
    include: {
      request: true,
    },
  });

  if (!donation) {
    throw new Error('Donation record not found!');
  }

  if (donation.request.patientId !== patientId) {
    throw new Error('You are not authorized to pay for this request!');
  }

  // Stripe Checkout Session জেনারেট করা
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Blood Donation Financial Support',
          },
          unit_amount: Math.round(amount * 100), // সেন্টে কনভার্ট করা
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    // 👈 পেমেন্ট সফল হলে এই URL-এ session_id এবং donation_id নিয়ে অটো রিডাইরেক্ট হবে
    success_url: `http://localhost:5000/api/v1/payment/confirm?session_id={CHECKOUT_SESSION_ID}&donation_id=${donationId}`,
    cancel_url: `http://localhost:5000/api/v1/payment/cancel`,
  });

  return {
    sessionId: session.id,
    paymentUrl: session.url,
  };
};

// ২. পেমেন্ট কনফার্মেশন ও ডাটাবেজ আপডেট logic (Webhook ছাড়াই)
const confirmPaymentInDB = async (sessionId: string, donationId: string) => {
  // Stripe থেকে সেশনের পেমেন্ট স্ট্যাটাস ভ্যালিডেট করা
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status === 'paid') {
    // ডাটাবেজে স্ট্যাটাস আপডেট করা
    const updatedDonation = await prisma.donationRecord.update({
      where: { id: donationId },
      data: {
        paymentStatus: 'PAID',
      },
    });

    return updatedDonation;
  } else {
    throw new Error('Payment verification failed or payment is incomplete!');
  }
};

// ৩. পেমেন্ট হিস্ট্রি বের করা
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