import multer from 'multer';
import cloudinary from '../App/builder/config/cloudinary.config.js';


const storage = multer.memoryStorage();

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, 
  },
});


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