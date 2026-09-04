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