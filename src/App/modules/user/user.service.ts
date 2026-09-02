import { PrismaClient } from '../../../../prisma/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export interface IUpdateProfilePayload {
  location?: string;
  phone?: string;
  availabilityStatus?: boolean;
  lastDonationDate?: string;
}

export interface IDonorQueryFilters {
  bloodGroup?: string;
  location?: string;
  availabilityStatus?: string | boolean;
}


const getMyProfileFromDB = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      bloodGroup: true,
      city: true,
      phoneNumber: true,
      isAvailable: true,
      lastDonatedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new Error('User not found!');
  }

  return user;
};


const updateMyProfileInDB = async (
  userId: string,
  payload: IUpdateProfilePayload
) => {
  const isUserExist = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!isUserExist) {
    throw new Error('User does not exist!');
  }

  const updateData: Record<string, any> = {};

  if (payload.location !== undefined) updateData.city = payload.location;
  if (payload.phone !== undefined) updateData.phoneNumber = payload.phone;
  if (payload.availabilityStatus !== undefined) updateData.isAvailable = payload.availabilityStatus;
  if (payload.lastDonationDate !== undefined) {
    updateData.lastDonatedAt = new Date(payload.lastDonationDate);
  }

  const result = await prisma.user.update({
    where: {
      id: userId,
    },
    data: updateData,
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      bloodGroup: true,
      city: true,
      phoneNumber: true,
      isAvailable: true,
      lastDonatedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return result;
};


const getAllDonorsFromDB = async (filters: IDonorQueryFilters) => {
  const { bloodGroup, location, availabilityStatus } = filters;
  const whereConditions: Record<string, any> = {};

  if (bloodGroup) {
    whereConditions.bloodGroup = bloodGroup;
  }

  if (location) {
    whereConditions.city = {
      contains: location,
      mode: 'insensitive',
    };
  }

  if (availabilityStatus !== undefined) {
    whereConditions.isAvailable = availabilityStatus === 'true' || availabilityStatus === true;
  }

  const result = await prisma.user.findMany({
    where: whereConditions,
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      bloodGroup: true,
      city: true,
      phoneNumber: true,
      isAvailable: true,
      lastDonatedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return result;
};

export const UserService = {
  getMyProfileFromDB,
  updateMyProfileInDB,
  getAllDonorsFromDB,
};