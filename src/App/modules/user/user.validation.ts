import { z } from 'zod';

const updateProfileValidationSchema = z.object({
  body: z.object({
    fullName: z
      .string({
        message: 'Full name must be a string',
      })
      .optional(),
    phone: z
      .string({
        message: 'Phone number must be a string',
      })
      .optional(),
    location: z
      .string({
        message: 'Location must be a string',
      })
      .optional(),
    bloodGroup: z
      .enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], {
        message: 'Invalid blood group type',
      })
      .optional(),
    availabilityStatus: z
      .boolean({
        message: 'Availability status must be a boolean (true/false)',
      })
      .optional(),
    lastDonationDate: z
      .string({
        message: 'Last donation date must be a valid date string',
      })
      .optional(),
  }),
});

export const UserValidation = {
  updateProfileValidationSchema,
};