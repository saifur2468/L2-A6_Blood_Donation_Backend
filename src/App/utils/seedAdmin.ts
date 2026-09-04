import bcrypt from 'bcrypt';
import { PrismaClient, Role, BloodGroup } from '../../../prisma/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export const seedAdmin = async () => {
  const isAdminExist = await prisma.user.findUnique({
    where: { email: 'admin69@gmail.com' },
  });

  if (!isAdminExist) {
    const hashedPassword = await bcrypt.hash('adminAB@##78', 10);
    await prisma.user.create({
      data: {
        fullName: 'System Admin',
        email: 'admin69@gmail.com',
        password: hashedPassword,
        role: Role.ADMIN,
        bloodGroup: BloodGroup.O_POSITIVE,
        city: 'Dhaka',
        phoneNumber: '01700000000',
        isAvailable: false,
      },
    });
    console.log(' Admin account created successfully!');
  }
};