import { PrismaClient } from '../../../../prisma/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import crypto from 'crypto'; 


// const resetToken = crypto.randomBytes ? crypto.randomBytes(32).toString('hex') : Math.random().toString(36).substring(2) + Date.now().toString(36);
dotenv.config();

const connectionString = String(process.env.DATABASE_URL || '');
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });


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
// const loginUser = async (payload: { email: string; password: string }) => {
//   const user = await prisma.user.findUnique({
//     where: { email: payload.email },
//   });

//   if (!user) {
//     throw new Error('User not found with this email!');
//   }

//   if (!user.password) {
//     throw new Error('This account uses Google login. Please log in with Google.');
//   }

//   const isPasswordMatched = await bcrypt.compare(payload.password, user.password);

//   if (!isPasswordMatched) {
//     throw new Error('Incorrect password!');
//   }

//   const { accessToken, refreshToken } = issueTokensForUser({
//     id: user.id,
//     email: user.email,
//     role: user.role,
//   });

//   return {
//     accessToken,
//     refreshToken,
//     user: {
//       id: user.id,
//       fullName: user.fullName,
//       email: user.email,
//       role: user.role,
//     },
//   };
// };

const loginUser = async (payload: { email: string; password: string }) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });
  console.log("LOGIN CHECK - User Data:", { email: user?.email, isBlocked: user?.isBlocked });

  if (!user) {
    throw new Error('User not found with this email!');
  }

  
  if (user.isBlocked) {
    throw new Error('Your account has been blocked by the admin. You cannot log in.');
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
 
  const isUserExists = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!isUserExists) {
    throw new Error('User not found!');
  }

  
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

 
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: payload, 
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      bloodGroup: true,
      city: true,
      location: true,          
      phoneNumber: true,       
      isAvailable: true,       
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
// 6. FORGOT / RESET PASSWORD
// ==========================================
const hashToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex');

const forgotPasswordInDB = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  // user na thakle / blocked hole null return (controller generic response dibe)
  if (!user || user.isDeleted || user.isBlocked) return null;

  const rawToken = crypto.randomBytes(32).toString('hex');

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: hashToken(rawToken),
      passwordResetExpires: new Date(Date.now() + 15 * 60 * 1000), // 15 min
    },
  });

  return { email: user.email, fullName: user.fullName, rawToken };
};

const resetPasswordInDB = async (payload: { email: string; token: string; newPassword: string }) => {
  const { email, token, newPassword } = payload;

  const user = await prisma.user.findFirst({
    where: {
      email, 
      passwordResetToken: hashToken(token), 
      passwordResetExpires: { gt: new Date() }, 
    },
  });

  if (!user || user.isDeleted || user.isBlocked) {
    throw new Error("Invalid or expired reset token!");
  }


  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });

  return { message: "Password reset successfully" };
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
  resetPasswordInDB,
  forgotPasswordInDB,
};