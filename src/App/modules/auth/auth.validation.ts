import { z } from 'zod';
import { BloodGroup, Role } from '../../../../prisma/generated/prisma/enums.js';

export const registerValidationSchema = z.object({
  body: z.object({
    // email validation update
    email: z.string().email({ message: 'Invalid email address' }),
    
    // password validation update
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
    
    fullName: z.string().min(1, { message: 'Full name is required' }),
    phoneNumber: z.string().min(11, { message: 'Phone number must be at least 11 digits' }),
    
    // Enum validation fix using z.enum with Object.values
    role: z
      .enum(Object.values(Role) as [string, ...string[]])
      .optional()
      .default(Role.PATIENT),
      
    bloodGroup: z
      .enum(Object.values(BloodGroup) as [string, ...string[]])
      .optional(),
      
    city: z.string().optional(),
    location: z.string().optional(),
  }),
});


export const loginValidationSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const googleLoginValidationSchema = z.object({
  body: z.object({
    idToken: z.string().min(1, 'Google ID token is required'),
  }),
});

export const AuthValidation = {
  registerValidationSchema,
  loginValidationSchema,
  googleLoginValidationSchema,
};




// import { z } from 'zod';

// export const registerValidationSchema = z.object({
//   body: z.object({
//     email: z.string().email('Invalid email address'),
//     password: z.string().min(6, 'Password must be at least 6 characters'),
//     fullName: z.string().min(1, 'Full name is required'),
//   }),
// });

// export const loginValidationSchema = z.object({
//   body: z.object({
//     email: z.string().email('Invalid email address'),
//     password: z.string().min(1, 'Password is required'),
//   }),
// });