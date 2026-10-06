import nodemailer from 'nodemailer';

export const sendEmail = async (to: string, subject: string, htmlContent: string) => {
  if (!process.env.NODE_MAILER_EMAIL || !process.env.NODE_MAILER_PASS) {
    throw new Error('NODE_MAILER_EMAIL or NODE_MAILER_PASS is missing in env');
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.NODE_MAILER_EMAIL,
      pass: process.env.NODE_MAILER_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: `"Blood Donation App" <${process.env.NODE_MAILER_EMAIL}>`,
    to,
    subject,
    html: htmlContent,
  });

  console.log('Email sent:', info.messageId);
};