// import { PrismaClient } from '../../../../prisma/generated/prisma/client.js';
// import { PrismaPg } from '@prisma/adapter-pg';
// import pg from 'pg';
// import dotenv from 'dotenv';
// import bcrypt from "bcrypt";
// import jwt from 'jsonwebtoken';
// dotenv.config();


// const connectionString = String(process.env.DATABASE_URL || '');

// const pool = new pg.Pool({ connectionString });
// const adapter = new PrismaPg(pool);
// const prisma = new PrismaClient({ adapter });

// const registerUserInDB = async (payload: any) => {
  
//   const isUserExists = await prisma.user.findUnique({
//     where: { email: payload.email },
//   });

//   if (isUserExists) {
//     throw new Error('User with this email already exists!');
//   }

  
//   const hashedPassword = await bcrypt.hash(payload.password, 10);

 
//   const newUser = await prisma.user.create({
//     data: {
//       fullName: payload.fullName,
//       email: payload.email,
//       password: hashedPassword,
//       phoneNumber: payload.phoneNumber,
//       bloodGroup: payload.bloodGroup,
//       city: payload.city,
//       role: payload.role || Role.PATIENT, 
//     },
//     select: {
//       id: true,
//       fullName: true,
//       email: true,
//       role: true,
//       bloodGroup: true,
//       city: true,
//       phoneNumber: true,
//       createdAt: true,
//     },
//   });

//   return newUser;
// };

// const loginUserInDB = async (payload: any) => {
//   const user = await prisma.user.findUnique({
//     where: { email: payload.email },
//   });

//   // if (!user) {
//   //   throw new Error('User not found!');
//   // }

//   // const isPasswordMatched = await bcrypt.compare(payload.password, user.password);

//   // if (!isPasswordMatched) {
//   //   throw new Error('Password incorrect!');
//   // }
// // auth.service.ts
// if (!User) {
//   throw new AppError(404, 'User does not exist!');
// }

// if (!(await PasswordMatched(password, User.password))) {
//   throw new AppError(401, 'Password does not match!');
// }
 
//   const accessToken = jwt.sign(
//     { id: user.id, email: user.email, role: user.role },
//     process.env.JWT_SECRET || 'secret',
//     { expiresIn: '7d' }
//   );

//   return {
//     accessToken,
//   };
// };

// export const AuthService = {
//   registerUserInDB,
//   registerUser: registerUserInDB, 
//   loginUserInDB,
//   loginUser: loginUserInDB,
// };










import { PrismaClient } from '../../../../prisma/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();

const connectionString = String(process.env.DATABASE_URL || '');

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ---------------- REGISTER ----------------
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
      role: payload.role || 'PATIENT',
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

// ---------------- JWT HELPER ----------------
const createToken = (
  jwtPayload: { id: string; email: string; role: string },
  secret: string,
  expiresIn: string
) => {
  return jwt.sign(jwtPayload, secret, { expiresIn } as jwt.SignOptions);
};

const issueTokensForUser = (user: { id: string; email: string; role: string }) => {
  const jwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    process.env.JWT_ACCESS_SECRET as string,
    process.env.JWT_ACCESS_EXPIRES_IN || '1d'
  );

  const refreshToken = createToken(
    jwtPayload,
    process.env.JWT_REFRESH_SECRET as string,
    process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  );

  return { accessToken, refreshToken };
};

// ---------------- LOGIN ----------------
const loginUser = async (payload: { email: string; password: string }) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new Error('User not found with this email!');
  }

  // Google দিয়ে signup করা user password ছাড়া normal login করতে পারবে না
  if (!user.password) {
    throw new Error('This account uses Google login. Please log in with Google.');
  }

  const isPasswordMatched = await bcrypt.compare(payload.password, user.password);

  if (!isPasswordMatched) {
    throw new Error('Incorrect password!');
  }

  const { accessToken, refreshToken } = issueTokensForUser({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  };
};

// ---------------- LOGOUT ----------------
// simple in-memory blacklist (production এ Redis ব্যবহার করা ভালো)
const tokenBlacklist = new Set<string>();

const logoutUser = async (token: string, email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new Error('User not found!');
  }

  tokenBlacklist.add(token);

  return { message: 'Logged out successfully!' };
};

const isTokenBlacklisted = (token: string) => {
  return tokenBlacklist.has(token);
};

// ---------------- GOOGLE LOGIN ----------------
const findOrCreateGoogleUser = async (profile: {
  id: string;
  emails?: { value: string }[];
  displayName?: string;
}) => {
  const email = profile.emails?.[0]?.value;

  if (!email) {
    throw new Error('No email found from Google profile');
  }

  let user = await prisma.user.findFirst({
    where: {
      OR: [{ googleId: profile.id }, { email }],
    },
  });

  if (user) {
    if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: profile.id },
      });
    }
  } else {
    user = await prisma.user.create({
      data: {
        fullName: profile.displayName || 'Google User',
        email,
        googleId: profile.id,
        password: null,
        role: 'PATIENT',
      },
    });
  }

  return user;
};

export const AuthService = {
  registerUserInDB,
  loginUser,
  logoutUser,
  isTokenBlacklisted,
  issueTokensForUser,
  findOrCreateGoogleUser,
};