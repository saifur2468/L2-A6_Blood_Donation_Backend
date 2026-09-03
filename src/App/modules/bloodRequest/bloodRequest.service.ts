// import { PrismaClient, RequestStatus } from '../../../../prisma/generated/prisma/client.js';
// import { PrismaPg } from '@prisma/adapter-pg';
// import pg from 'pg';

// const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
// const adapter = new PrismaPg(pool);
// const prisma = new PrismaClient({ adapter });


// const createBloodRequestInDB = async (patientId: string, payload: any) => {
//   const result = await prisma.bloodRequest.create({
//     data: {
//       patientId: patientId,
  
//       bloodGroup: payload.bloodGroup,
//       bagsNeeded: Number(payload.bagsNeeded || 1),
//       hospitalName: payload.hospitalName,
//       hospitalAddress: payload.hospitalAddress,
//       city: payload.city || payload.location,
//       urgency: payload.urgency || payload.urgencyType || 'EMERGENCY',
//       neededBy: new Date(payload.neededBy || payload.neededAt),
//       contactNumber: payload.contactNumber,
//       status: RequestStatus.PENDING,
//     },
//     include: {
//       patient: {
//         select: { 
//           id: true, 
//           fullName: true, 
//           email: true, 
//           phoneNumber: true 
//         },
//       },
//     },
//   });

//   return result;
// };


// const getMyRequestsFromDB = async (patientId: string) => {
//   return await prisma.bloodRequest.findMany({
//     where: { 
//       patientId: patientId, 
//       isDeleted: false 
//     },
//     include: {
//       donations: {
//         include: {
//           donor: {
//             select: {
//               id: true,
//               fullName: true,
//               phoneNumber: true,
//               email: true,
//               city: true,
//               isAvailable: true,
//             },
//           },
//         },
//       },
//     },
//     orderBy: { createdAt: 'desc' },
//   });
// };


// const cancelBloodRequestInDB = async (requestId: string, patientId: string) => {
//   const request = await prisma.bloodRequest.findFirst({
//     where: { id: requestId, isDeleted: false },
//   });

//   if (!request) {
//     throw new Error('Blood request not found!');
//   }

//   if (request.patientId !== patientId) {
//     throw new Error('You are not authorized to cancel this request!');
//   }

//   if (request.status === RequestStatus.COMPLETED) {
//     throw new Error('Cannot cancel a completed blood request!');
//   }

//   return await prisma.bloodRequest.update({
//     where: { id: requestId },
//     data: { status: RequestStatus.CANCELLED },
//   });
// };


// const completeBloodRequestInDB = async (requestId: string, patientId: string) => {
//   const request = await prisma.bloodRequest.findFirst({
//     where: { id: requestId, isDeleted: false },
//   });

//   if (!request || request.patientId !== patientId) {
//     throw new Error('Blood request not found or unauthorized!');
//   }

//   const result = await prisma.bloodRequest.update({
//     where: { id: requestId },
//     data: { status: RequestStatus.COMPLETED },
//   });

//   return result;
// };

// export const BloodRequestService = {
//   createBloodRequestInDB,
//   getMyRequestsFromDB,
//   cancelBloodRequestInDB,
//   completeBloodRequestInDB,
// };



import { PrismaClient } from '../../../../prisma/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = String(process.env.DATABASE_URL || '');
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ১. নতুন ব্লাড রিকোয়েস্ট তৈরি
const createBloodRequestInDB = async (patientId: string, payload: any) => {
  const result = await prisma.bloodRequest.create({
    data: {
      patientId,
      bloodGroup: payload.bloodGroup,
      bagsNeeded: payload.bagsNeeded,
      hospitalName: payload.hospitalName,
      hospitalAddress: payload.hospitalAddress,
      city: payload.city,
      urgency: payload.urgency,
      neededBy: new Date(payload.neededBy),
      contactNumber: payload.contactNumber,
    },
  });
  return result;
};

// ২. পেশেন্ট তার নিজের সব রিকোয়েস্ট দেখবে
const getMyRequestsFromDB = async (patientId: string) => {
  const result = await prisma.bloodRequest.findMany({
    where: {
      patientId,
      isDeleted: false,
    },
    include: {
      donations: {
        include: {
          donor: {
            select: {
              fullName: true,
              phoneNumber: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return result;
};

// ৩. পেশেন্ট নিজের কোনো রিকোয়েস্ট আপডেট করবে
const updateMyRequestInDB = async (patientId: string, requestId: string, payload: any) => {
  const isExist = await prisma.bloodRequest.findFirst({
    where: { id: requestId, patientId, isDeleted: false },
  });

  if (!isExist) {
    throw new Error('Blood request not found or unauthorized!');
  }

  if (payload.neededBy) {
    payload.neededBy = new Date(payload.neededBy);
  }

  const result = await prisma.bloodRequest.update({
    where: { id: requestId },
    data: payload,
  });
  return result;
};

// ৪. পেশেন্ট নিজের রিকোয়েস্ট ক্যানসেল/ডিলিট করবে
const deleteMyRequestInDB = async (patientId: string, requestId: string) => {
  const isExist = await prisma.bloodRequest.findFirst({
    where: { id: requestId, patientId, isDeleted: false },
  });

  if (!isExist) {
    throw new Error('Blood request not found or unauthorized!');
  }

  const result = await prisma.bloodRequest.update({
    where: { id: requestId },
    data: { isDeleted: true },
  });
  return result;
};

export const BloodRequestService = {
  createBloodRequestInDB,
  getMyRequestsFromDB,
  updateMyRequestInDB,
  deleteMyRequestInDB,
};