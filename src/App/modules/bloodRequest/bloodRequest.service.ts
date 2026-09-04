import { PrismaClient } from '../../../../prisma/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = String(process.env.DATABASE_URL || '');
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });


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
              id: true,
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



const getAllPendingRequestsFromDB = async () => {
  const result = await prisma.bloodRequest.findMany({
    where: {
      status: 'PENDING',
      isDeleted: false,
    },
    include: {
      patient: {
        select: {
          id: true,
          fullName: true,
          phoneNumber: true,
          email: true,
        },
      },
    },
    orderBy: {
      donatedAt: 'desc',
    },
  });
  return result;
};


const acceptBloodRequestInDB = async (requestId: string, donorId: string) => {
  const request = await prisma.bloodRequest.findUnique({
    where: { id: requestId, isDeleted: false },
  });

  if (!request) {
    throw new Error('Blood request not found!');
  }

  if (request.status !== 'PENDING') {
    throw new Error('This blood request is no longer pending!');
  }


  const result = await prisma.$transaction(async (tx) => {
    const updatedRequest = await tx.bloodRequest.update({
      where: { id: requestId },
      data: { status: 'IN_PROGRESS' },
    });

    const donation = await tx.donationRecord.create({
      data: {
        requestId: requestId,
        donorId: donorId,
        paymentStatus: 'PENDING',
      },
    });

    return { updatedRequest, donation };
  });

  return result;
};

export const BloodRequestService = {
  createBloodRequestInDB,
  getMyRequestsFromDB,
  updateMyRequestInDB,
  deleteMyRequestInDB,
  getAllPendingRequestsFromDB,
  acceptBloodRequestInDB,
};