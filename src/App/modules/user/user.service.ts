import { PrismaClient } from '../../../../prisma/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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

export const UserService = {
  getMyProfileFromDB,
};