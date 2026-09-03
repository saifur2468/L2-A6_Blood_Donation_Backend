// import { z } from 'zod';
// import { BloodGroup, Role } from '../../../../prisma/generated/prisma/enums.js';

// export const registerValidationSchema = z.object({
//   body: z.object({
//     // email validation update
//     email: z.string().email({ message: 'Invalid email address' }),
    
//     // password validation update
//     password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
    
//     fullName: z.string().min(1, { message: 'Full name is required' }),
//     phoneNumber: z.string().min(11, { message: 'Phone number must be at least 11 digits' }),
    
//     // Enum validation fix using z.enum with Object.values
//     role: z
//       .enum(Object.values(Role) as [string, ...string[]])
//       .optional()
//       .default(Role.PATIENT),
      
//     bloodGroup: z
//       .enum(Object.values(BloodGroup) as [string, ...string[]])
//       .optional(),
      
//     city: z.string().optional(),
//     location: z.string().optional(),
//   }),
// });


// export const loginValidationSchema = z.object({
//   body: z.object({
//     email: z.string().email('Invalid email address'),
//     password: z.string().min(1, 'Password is required'),
//   }),
// });

// export const googleLoginValidationSchema = z.object({
//   body: z.object({
//     idToken: z.string().min(1, 'Google ID token is required'),
//   }),
// });

// export const AuthValidation = {
//   registerValidationSchema,
//   loginValidationSchema,
//   googleLoginValidationSchema,
// };




// // import { z } from 'zod';

// // export const registerValidationSchema = z.object({
// //   body: z.object({
// //     email: z.string().email('Invalid email address'),
// //     password: z.string().min(6, 'Password must be at least 6 characters'),
// //     fullName: z.string().min(1, 'Full name is required'),
// //   }),
// // });

// // export const loginValidationSchema = z.object({
// //   body: z.object({
// //     email: z.string().email('Invalid email address'),
// //     password: z.string().min(1, 'Password is required'),
// //   }),
// // });


import { z } from 'zod';
import { Role, BloodGroup } from '../../../../prisma/generated/prisma/client.js';

const registerValidationSchema = z.object({
  body: z.object({
    fullName: z.string({ required_error: 'Full name is required' }),
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
    password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters'),
    phoneNumber: z.string({ required_error: 'Phone number is required' }),
    bloodGroup: z.nativeEnum(BloodGroup, { required_error: 'Blood group is required' }),
    city: z.string({ required_error: 'City is required' }),
    // 🔒 কেবল DONOR এবং PATIENT অনুমোদিত (ADMIN হওয়া যাবে না)
    role: z.enum(['DONOR', 'PATIENT'] as const, {
      invalid_type_error: 'Role must be either DONOR or PATIENT',
    }).default('PATIENT'), 
  }),
});

const loginValidationSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
    password: z.string({ required_error: 'Password is required' }),
  }),
});

export const AuthValidation = {
  registerValidationSchema,
  loginValidationSchema,
};