import cloudinary from '../../App/builder/config/cloudinary.config.js';

export const uploadPdfBufferToCloudinary = (
  buffer: Buffer,
  fileName: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        folder: 'payment-receipts',
        public_id: `${fileName}.pdf`, // 👈 format: 'pdf' বাদ দিয়ে এখানে .pdf দেওয়া নিশ্চিত করুন
      },
      (error, result) => {
        if (error || !result) {
          console.error('❌ Cloudinary Upload Error Details:', error);
          return reject(error || new Error('Cloudinary upload failed'));
        }
        resolve(result.secure_url);
      }
    );

    uploadStream.end(buffer);
  });
};