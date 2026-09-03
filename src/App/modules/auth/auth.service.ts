// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
// import { OAuth2Client } from 'google-auth-library';
// import prisma from '../../../lib/prisma.js';
// import { PrismaClient, Role } from '../../../../prisma/generated/prisma/client.js';

// // const prisma = new PrismaClient();
// const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// const generateToken = (user: { id: string; email: string; role: Role }) => {
//   return jwt.sign(
//     { userId: user.id, email: user.email, role: user.role },
//     process.env.JWT_SECRET || 'secret_key',
//     { expiresIn: '7d' }
//   );
// };

// const registerUserIntoDB = async (payload: any) => {
//   const existingUser = await prisma.user.findUnique({
//     where: { email: payload.email },
//   });

//   if (existingUser) {
//     throw new Error('User with this email already exists!');
//   }

//   const hashedPassword = await bcrypt.hash(payload.password, 12);

//   const newUser = await prisma.user.create({
//     data: {
//       ...payload,
//       password: hashedPassword,
//     },
//     select: {
//       id: true,
//       email: true,
//       fullName: true,
//       phoneNumber: true,
//       role: true,
//       bloodGroup: true,
//       city: true,
//       createdAt: true,
//     },
//   });

//   return newUser;
// };

// const loginUserFromDB = async (payload: { email: string; password: string }) => {
//   const user = await prisma.user.findUnique({
//     where: { email: payload.email },
//   });

//   if (!user || !user.password) {
//     throw new Error('Invalid credentials!');
//   }

//   const isPasswordMatched = await bcrypt.compare(payload.password, user.password);
//   if (!isPasswordMatched) {
//     throw new Error('Invalid credentials!');
//   }

//   const accessToken = generateToken(user);

//   return {
//     accessToken,
//     user: {
//       id: user.id,
//       email: user.email,
//       fullName: user.fullName,
//       role: user.role,
//     },
//   };
// };

// const googleLoginFromDB = async (idToken: string) => {
//   // Verify Google ID Token from Frontend
//   const ticket = await googleClient.verifyIdToken({
//     idToken,
//     audience: process.env.GOOGLE_CLIENT_ID,
//   });

//   const payload = ticket.getPayload();
//   if (!payload || !payload.email) {
//     throw new Error('Invalid Google Token');
//   }

//   const { email, name, picture } = payload;

//   let user = await prisma.user.findUnique({
//     where: { email },
//   });

//   // If user does not exist, auto-register them
//   if (!user) {
//     user = await prisma.user.create({
//       data: {
//         email,
//         fullName: name || 'Google User',
//         phoneNumber: '', // Can be updated later in profile
//         avatar: picture,
//         role: Role.PATIENT,
//       },
//     });
//   }

//   const accessToken = generateToken(user);

//   return {
//     accessToken,
//     user: {
//       id: user.id,
//       email: user.email,
//       fullName: user.fullName,
//       role: user.role,
//     },
//   };
// };

// export const AuthService = {
//   registerUserIntoDB,
//   loginUserFromDB,
//   googleLoginFromDB,
// };










// import dotenv from 'dotenv';
// dotenv.config();

// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
// import { PrismaClient } from '../../../../prisma/generated/prisma/client.js';
// import { jwtHelpers } from '../../utils/jwtHelpers.js';
// import { PrismaPg } from '@prisma/adapter-pg';
// import pg from 'pg';


// const connectionString = process.env.DATABASE_URL;

// if (!connectionString) {
//   throw new Error('DATABASE_URL is not defined in the environment variables!');
// }

// const pool = new pg.Pool({ connectionString });
// const adapter = new PrismaPg(pool);
// const prisma = new PrismaClient({ adapter });


// const registerUser = async (payload: any) => {
//   const hashedPassword = await bcrypt.hash(payload.password, 10);

//   const newUser = await prisma.user.create({
//     data: {
//       ...payload,
//       password: hashedPassword,
//     },
//   });

//   const { password, ...userWithoutPassword } = newUser;
//   return userWithoutPassword;
// };


// const loginUser = async (payload: { email: string; password: string }) => {
//   const user = await prisma.user.findUnique({
//     where: { email: payload.email },
//   });

//   if (!user) {
//     throw new Error('User not found!');
//   }

//   const isPasswordMatched = await bcrypt.compare(payload.password, user.password);
//   if (!isPasswordMatched) {
//     throw new Error('Password does not match!');
//   }

//   const jwtPayload = {
//     id: user.id,
//     email: user.email,
//     role: user.role,
//   };

//   const accessToken = jwtHelpers.generateToken(
//     jwtPayload,
//     process.env.JWT_SECRET || 'secret_key',
//     '1d'
//   );

//   const refreshToken = jwtHelpers.generateToken(
//     jwtPayload,
//     process.env.JWT_REFRESH_SECRET || 'refresh_secret_key',
//     '365d'
//   );

//   return { accessToken, refreshToken };
// };


// const logoutUser = async (token: string, email: string) => {
//   const decoded = jwt.verify(
//     token,
//     process.env.JWT_SECRET || 'secret_key'
//   ) as { email: string };

//   if (decoded.email !== email) {
//     throw new Error('Invalid token for this user email!');
//   }

//   return {
//     message: `User ${email} logged out successfully!`,
//   };
// };

// export const AuthService = {
//   registerUser,
//   loginUser,
//   logoutUser,
// };









import { PrismaClient } from '../../../../prisma/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
dotenv.config();

// 🔒 String Casting নিশ্চিত করা হয়েছে
const connectionString = String(process.env.DATABASE_URL || '');

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const registerUserInDB = async (payload: any) => {
  // ১. ইমেইল আগে থেকেই আছে কিনা চেক
  const isUserExists = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (isUserExists) {
    throw new Error('User with this email already exists!');
  }

  // ২. পাসওয়ার্ড হ্যাশ করা
  const hashedPassword = await bcrypt.hash(payload.password, 10);

  // ৩. ইউজার ক্রিয়েট করা (বডিতে রোল না পাঠালে অটোমেটিক PATIENT হবে)
  const newUser = await prisma.user.create({
    data: {
      fullName: payload.fullName,
      email: payload.email,
      password: hashedPassword,
      phoneNumber: payload.phoneNumber,
      bloodGroup: payload.bloodGroup,
      city: payload.city,
      role: payload.role || Role.PATIENT, // 👈 বডির রোল অনুযায়ী সেট হবে
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

  // JWT টোকেন জেনারেট করা (টোকেনে রোল অন্তর্ভুক্ত থাকবে)
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





