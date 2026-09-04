import { PrismaClient } from '../../../../prisma/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
dotenv.config();


const connectionString = String(process.env.DATABASE_URL || '');

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const registerUserInDB = async (payload: any) => {
  
  const isUserExists = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (isUserExists) {
    throw new Error('User with this email already exists!');
  }

  
  const hashedPassword = await bcrypt.hash(payload.password, 10);

 
  const newUser = await prisma.user.create({
    data: {
      fullName: payload.fullName,
      email: payload.email,
      password: hashedPassword,
      phoneNumber: payload.phoneNumber,
      bloodGroup: payload.bloodGroup,
      city: payload.city,
      role: payload.role || Role.PATIENT, 
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      bloodGroup: true,
      city: true,
      phoneNumber: true,
      createdAt: true,
    },
  });

  return newUser;
};

const loginUserInDB = async (payload: any) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new Error('User not found!');
  }

  const isPasswordMatched = await bcrypt.compare(payload.password, user.password);

  if (!isPasswordMatched) {
    throw new Error('Password incorrect!');
  }

 
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  );

  return {
    accessToken,
  };
};

export const AuthService = {
  registerUserInDB,
  registerUser: registerUserInDB, 
  loginUserInDB,
  loginUser: loginUserInDB,
};





