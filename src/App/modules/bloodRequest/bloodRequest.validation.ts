// import { z } from 'zod';
// import { BloodGroup, UrgencyLevel, RequestStatus } from '../../../../prisma/generated/prisma/client.js';

// const createBloodRequestSchema = z.object({
//   body: z.object({
//     bloodGroup: z.nativeEnum(BloodGroup, { required_error: 'Blood group is required' }),
//     bagsNeeded: z.number().min(1, 'At least 1 bag is required').default(1),
//     hospitalName: z.string({ required_error: 'Hospital name is required' }),
//     hospitalAddress: z.string({ required_error: 'Hospital address is required' }),
//     city: z.string({ required_error: 'City is required' }),
//     urgency: z.nativeEnum(UrgencyLevel, { required_error: 'Urgency level is required' }),
//     neededBy: z.string({ required_error: 'Needed by date is required' }),
//     contactNumber: z.string({ required_error: 'Contact number is required' }),
//   }),
// });


// const updateStatusSchema = z.object({
//   body: z.object({
//     status: z.nativeEnum(RequestStatus, { required_error: 'Valid status is required' }),
//   }),
// });

// export const BloodRequestValidation = {
//   createBloodRequestSchema,
//   updateStatusSchema,
// };













import { z } from 'zod';
import { BloodGroup, UrgencyLevel} from '../../../../prisma/generated/prisma/client.js';

const createBloodRequestSchema = z.object({
  body: z.object({
    bloodGroup: z.nativeEnum(BloodGroup, { required_error: 'Blood group is required' }),
    bagsNeeded: z.number({ required_error: 'Bags needed is required' }).min(1, 'At least 1 bag is needed'),
    hospitalName: z.string({ required_error: 'Hospital name is required' }),
    hospitalAddress: z.string({ required_error: 'Hospital address is required' }),
    city: z.string({ required_error: 'City is required' }),
    urgency: z.nativeEnum(UrgencyLevel, { required_error: 'Urgency level is required' }),
    neededBy: z.string({ required_error: 'Needed date is required' }), // e.g. "2026-09-10T10:00:00.000Z"
    contactNumber: z.string({ required_error: 'Contact number is required' }),
  }),
});

const updateBloodRequestSchema = z.object({
  body: z.object({
    bloodGroup: z.nativeEnum(BloodGroup).optional(),
    bagsNeeded: z.number().min(1).optional(),
    hospitalName: z.string().optional(),
    hospitalAddress: z.string().optional(),
    city: z.string().optional(),
    urgency: z.nativeEnum(UrgencyLevel).optional(),
    neededBy: z.string().optional(),
    contactNumber: z.string().optional(),
  }),
});

export const BloodRequestValidation = {
  createBloodRequestSchema,
  updateBloodRequestSchema,
};