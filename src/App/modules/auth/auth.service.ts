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

// ==========================================
// TOKEN GENERATION HELPERS
// ==========================================
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
    process.env.JWT_ACCESS_SECRET || 'fallback_access_secret',
    process.env.JWT_ACCESS_EXPIRES_IN || '1d'
  );

  const refreshToken = createToken(
    jwtPayload,
    process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
    process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  );

  return { accessToken, refreshToken };
};

// ==========================================
// 1. REGISTER USER
// ==========================================
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

// ==========================================
// 2. LOGIN USER
// ==========================================
const loginUser = async (payload: { email: string; password: string }) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new Error('User not found with this email!');
  }

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

// ==========================================
// 3. UPDATE PROFILE (FIXED UPDATE ISSUE)
// ==========================================
const updateMyProfileInDB = async (userId: string, payload: any) => {
  // ১. ইউজার ডাটাবেজে আছে কিনা চেক
  const isUserExists = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!isUserExists) {
    throw new Error('User not found!');
  }

  // ২. Blood Group Format Convert করা (যেমন: "AB+" -> "AB_POSITIVE")
  if (payload.bloodGroup) {
    const bloodGroupMap: Record<string, string> = {
      'A+': 'A_POSITIVE',
      'A-': 'A_NEGATIVE',
      'B+': 'B_POSITIVE',
      'B-': 'B_NEGATIVE',
      'AB+': 'AB_POSITIVE',
      'AB-': 'AB_NEGATIVE',
      'O+': 'O_POSITIVE',
      'O-': 'O_NEGATIVE',
    };

    if (bloodGroupMap[payload.bloodGroup]) {
      payload.bloodGroup = bloodGroupMap[payload.bloodGroup];
    }
  }

  // ৩. Prisma DB Update Execute (Schema অনুযায়ী সব ফিল্ড সিলেক্ট করা হয়েছে)
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: payload, // payload-এ phoneNumber, bloodGroup, city, location, isAvailable সব আপডেট হবে
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      bloodGroup: true,
      city: true,
      location: true,          // <--- missing field added
      phoneNumber: true,       // <--- missing field added
      isAvailable: true,       // <--- missing field added
      profilePhoto: true,
      lastDonatedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};
// ==========================================
// 4. LOGOUT & BLACKLIST
// ==========================================
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

// ==========================================
// 5. GOOGLE OAUTH USER
// ==========================================
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
  updateMyProfileInDB,
  logoutUser,
  isTokenBlacklisted,
  issueTokensForUser,
  findOrCreateGoogleUser,
};