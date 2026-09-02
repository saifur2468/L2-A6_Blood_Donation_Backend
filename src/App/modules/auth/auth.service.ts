import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../../../lib/prisma.js';
import { PrismaClient, Role } from '../../../../prisma/generated/prisma/client.js';

// const prisma = new PrismaClient();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (user: { id: string; email: string; role: Role }) => {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'secret_key',
    { expiresIn: '7d' }
  );
};

const registerUserIntoDB = async (payload: any) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new Error('User with this email already exists!');
  }

  const hashedPassword = await bcrypt.hash(payload.password, 12);

  const newUser = await prisma.user.create({
    data: {
      ...payload,
      password: hashedPassword,
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      phoneNumber: true,
      role: true,
      bloodGroup: true,
      city: true,
      createdAt: true,
    },
  });

  return newUser;
};

const loginUserFromDB = async (payload: { email: string; password: string }) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user || !user.password) {
    throw new Error('Invalid credentials!');
  }

  const isPasswordMatched = await bcrypt.compare(payload.password, user.password);
  if (!isPasswordMatched) {
    throw new Error('Invalid credentials!');
  }

  const accessToken = generateToken(user);

  return {
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
  };
};

const googleLoginFromDB = async (idToken: string) => {
  // Verify Google ID Token from Frontend
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw new Error('Invalid Google Token');
  }

  const { email, name, picture } = payload;

  let user = await prisma.user.findUnique({
    where: { email },
  });

  // If user does not exist, auto-register them
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        fullName: name || 'Google User',
        phoneNumber: '', // Can be updated later in profile
        avatar: picture,
        role: Role.PATIENT,
      },
    });
  }

  const accessToken = generateToken(user);

  return {
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
  };
};

export const AuthService = {
  registerUserIntoDB,
  loginUserFromDB,
  googleLoginFromDB,
};