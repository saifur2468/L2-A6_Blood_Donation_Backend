import nodemailer from "nodemailer";

export const sendEmail = async (to: string, subject: string, htmlContent: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODE_MAILER_EMAIL,
      pass: process.env.NODE_MAILER_PASS,
    },
  });

  const mailOptions = {
    from: `"Blood Donation App" <${process.env.NODE_MAILER_EMAIL}>`,
    to: to,
    subject: subject,
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
};