import PDFDocument from 'pdfkit';

interface ReceiptData {
  donationId: string;
  patientName?: string;
  amount: number;
  currency: string;
  sessionId: string;
  paidAt: Date;
  bloodGroup?: string;
  hospitalName?: string;
}

export const generateReceiptPdfBuffer = (data: ReceiptData): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc
        .fontSize(20)
        .fillColor('#c0392b')
        .text('Payment Receipt', { align: 'center' })
        .moveDown(1.5);

      doc
        .fontSize(11)
        .fillColor('#000')
        .text(`Receipt Date: ${data.paidAt.toLocaleString()}`)
        .text(`Donation ID: ${data.donationId}`)
        .text(`Stripe Session ID: ${data.sessionId}`)
        .moveDown(1);

      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(1);

      if (data.patientName) {
        doc.fontSize(12).text(`Patient Name: ${data.patientName}`);
      }
      if (data.bloodGroup) {
        doc.text(`Blood Group: ${data.bloodGroup}`);
      }
      if (data.hospitalName) {
        doc.text(`Hospital: ${data.hospitalName}`);
      }

      doc.moveDown(1);
      doc
        .fontSize(14)
        .fillColor('#27ae60')
        .text(
          `Amount Paid: ${data.amount.toFixed(2)} ${data.currency.toUpperCase()}`,
          { align: 'left' }
        );

      doc.moveDown(2);
      doc
        .fontSize(10)
        .fillColor('#888')
        .text('This is a system generated receipt for blood donation support payment.', {
          align: 'center',
        });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};