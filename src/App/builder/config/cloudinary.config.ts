import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer memory storage
const storage = multer.memoryStorage();

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// 👈 এই ফাংশনটি ইমপোর্ট করার চেষ্টা করছিলেন, তাই এটি এক্সপোর্ট করা আবশ্যক
export const sendImageToCloudinary = (
  imageName: string,
  buffer: Buffer
): Promise<Record<string, any>> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: imageName.trim(),
        folder: 'blood_donation_app',
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result as Record<string, any>);
        }
      }
    );

    uploadStream.end(buffer);
  });
};

export default cloudinary;