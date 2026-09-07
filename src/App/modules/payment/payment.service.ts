import Stripe from 'stripe';
import PDFDocument from 'pdfkit';
import prisma from '../../../lib/prisma.js';
import cloudinary from '../../builder/config/cloudinary.config.js';
import AppError from '../../errors/AppError.js';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});


export const uploadPdfBufferToCloudinary = (
  buffer: Buffer,
  fileName: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        folder: 'payment-receipts',
        public_id: `${fileName}.pdf`,
      },
      (error, result) => {
        if (error || !result) {
          console.error(' Cloudinary Upload Error Details:', error);
          return reject(error || new Error('Cloudinary upload failed'));
        }
        resolve(result.secure_url);
      }
    );

    uploadStream.end(buffer);
  });
};


const generatePDFBuffer = (data: {
  donationId: string;
  amount: number;
  hospitalName: string;
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
}): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const buffers: Buffer[] = [];

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', (err) => reject(err));

    doc.rect(30, 30, 535, 680).strokeColor('#e0e0e0').lineWidth(1).stroke();
    doc.fontSize(20).fillColor('#1a0933').font('Helvetica-Bold').text('Blood Donation Platform', 50, 55);

    doc.rect(430, 50, 115, 35).fill('#1b8e2d');
    doc.fontSize(14).fillColor('#ffffff').font('Helvetica-Bold').text('PAID', 472, 62);

    const formattedDate = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    doc.fontSize(10).fillColor('#444444').font('Helvetica');
    doc.text(`Order ID #: ${data.donationId.slice(0, 10)}`, 300, 115, { align: 'right', width: 245 });
    doc.text(`Date of purchase: ${formattedDate}`, 300, 130, { align: 'right', width: 245 });

    const startY = 175;
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#333333').text(data.hospitalName, 50, startY);
    doc.font('Helvetica').fillColor('#555555');
    doc.text('Level-4, Central Medical Area', 50, startY + 15);
    doc.text('Dhaka, Bangladesh', 50, startY + 30);
    doc.text('support@blooddonation.com', 50, startY + 45);
    doc.text('+8801700000000', 50, startY + 60);

    doc.font('Helvetica-Bold').fillColor('#333333').text(data.donorName, 300, startY, { align: 'right', width: 245 });
    doc.font('Helvetica').fillColor('#555555');
    doc.text(data.donorEmail || 'patient@gmail.com', 300, startY + 15, { align: 'right', width: 245 });
    doc.text(data.donorPhone || '+8801404260731', 300, startY + 30, { align: 'right', width: 245 });

    const table1Y = 270;
    doc.rect(50, table1Y, 495, 20).fill('#eeeeee');
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#333333');
    doc.text('Payment Method', 55, table1Y + 5);
    doc.text('Payment Info #', 300, table1Y + 5, { align: 'right', width: 240 });

    doc.font('Helvetica').fillColor('#555555');
    doc.text('Card / Stripe Online', 55, table1Y + 28);
    doc.text(data.donorPhone || '+8801404260731', 300, table1Y + 28, { align: 'right', width: 240 });
    doc.text(data.donationId.slice(0, 12).toUpperCase(), 300, table1Y + 42, { align: 'right', width: 240 });

    const table2Y = 350;
    doc.rect(50, table2Y, 495, 20).fill('#eeeeee');
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#333333');
    doc.text('Item', 55, table2Y + 5);
    doc.text('Price', 300, table2Y + 5, { align: 'right', width: 240 });

    doc.font('Helvetica').fillColor('#555555');
    doc.text('Emergency Blood Request Support Fee', 55, table2Y + 28);
    doc.text(`${data.amount} tk`, 300, table2Y + 28, { align: 'right', width: 240 });

    doc.moveTo(350, table2Y + 50).lineTo(545, table2Y + 50).strokeColor('#cccccc').lineWidth(1).stroke();

    const totalsY = table2Y + 60;
    doc.font('Helvetica-Bold').fillColor('#333333');
    doc.text(`Subtotal: ${data.amount} tk`, 300, totalsY, { align: 'right', width: 245 });
    doc.text('Discount: 0 tk', 300, totalsY + 15, { align: 'right', width: 245 });
    doc.text(`Total: ${data.amount} tk`, 300, totalsY + 30, { align: 'right', width: 245 });

    doc.end();
  });
};


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
    throw new AppError(404, 'Donation record not found!');
  }

  if (donation.request.patientId !== patientId) {
    throw new AppError(403, 'You are not authorized to pay for this request!');
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: 'Blood Donation Support Payment' },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    metadata: {
      donationId,
      patientId,
    },
    // success_url: `http://localhost:5000/api/v1/payment/success?donation_id=${donationId}`,
    // cancel_url: `http://localhost:5000/api/v1/payment/cancel`,
    success_url: `${BACKEND_URL}/api/v1/payment/success?donation_id=${donationId}`,
  cancel_url: `${BACKEND_URL}/api/v1/payment/cancel`,
  });

  return {
    sessionId: session.id,
    paymentUrl: session.url,
  };
};


const handleStripeWebhookEvent = async (rawBody: any, signature: string) => {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: any) {
    console.error(` Webhook Signature Verification Failed: ${err.message}`);
    throw err;
  }

  console.log(` Webhook Received Event Type: ${event.type}`);

  let donationId: string | undefined;
  let amount: number = 0;

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    donationId = session.metadata?.donationId;
    amount = (session.amount_total || 0) / 100;
  } else if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    donationId = paymentIntent.metadata?.donationId;
    amount = (paymentIntent.amount_received || 0) / 100;
  }

  if (donationId) {
    try {
      const donation = await prisma.donationRecord.findUnique({
        where: { id: donationId },
        include: { request: true, donor: true },
      });

      if (!donation) {
        console.error(' Donation Record not found in DB!');
        return;
      }

      console.log(' Generating PDF...');
      const pdfBuffer = await generatePDFBuffer({
        donationId,
        amount: amount || 100,
        hospitalName: donation.request.hospitalName,
        donorName: donation.donor?.fullName || 'Valued Donor',
      });

      console.log(' Uploading PDF to Cloudinary...');
      const pdfUrl = await uploadPdfBufferToCloudinary(pdfBuffer, `receipt_${donationId}`);
      console.log(' Cloudinary Upload Success URL:', pdfUrl);

      
      const updatedRecord = await prisma.donationRecord.update({
        where: { id: donationId },
        data: {
          paymentStatus: 'PAID',
          receiptUrl: pdfUrl, 
        },
      });

      console.log(' DB Update Complete. Saved Receipt URL:', updatedRecord.receiptUrl);
    } catch (error: any) {
      console.error(' ERROR inside Webhook Execution:', error.message || error);
    }
  }
};

const getPaymentStatusFromDB = async (donationId: string) => {
  const donation = await prisma.donationRecord.findUnique({
    where: { id: donationId },
    select: {
      id: true,
      paymentStatus: true,
      receiptUrl: true,
    },
  });

  if (!donation) {
    throw new AppError(404, 'Donation record not found!');
  }

  return donation;
};


const getMyPaymentHistoryFromDB = async (patientId: string) => {
  const result = await prisma.donationRecord.findMany({
    where: { request: { patientId } },
    select: {
      id: true,
      requestId: true,
      donorId: true,
      donatedAt: true,
      paymentStatus: true,
      receiptUrl: true, 
      request: {
        select: { bloodGroup: true, hospitalName: true, bagsNeeded: true },
      },
      donor: {
        select: { fullName: true, phoneNumber: true, email: true },
      },
    },
    orderBy: { donatedAt: 'desc' },
  });

  return result;
};

export const PaymentService = {
  createCheckoutSessionInStripe,
  handleStripeWebhookEvent,
  getPaymentStatusFromDB,
  getMyPaymentHistoryFromDB,
};
























