import { Role, RequestStatus } from '../../../../prisma/generated/prisma/client.js';
import prisma from '../../../lib/prisma.js';

const getAllUsersFromDB = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      isBlocked: true, 
      isDeleted: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

// const toggleUserBlockStatusInDB = async (adminId: string, userId: string, isBlocked: boolean) => {
//   const user = await prisma.user.update({
//     where: { id: userId },
//     data: { isBlocked },
//   });

//   await prisma.auditLog.create({
//     data: {
//       userId: adminId, 
//       entity: 'USER',
//       action: isBlocked ? 'USER_BLOCKED' : 'USER_UNBLOCKED',
//       details: `User ${user.email} was ${isBlocked ? 'blocked' : 'unblocked'}.`,
//     },
//   });

//   return user;
// };












const toggleUserBlockStatusInDB = async (adminId: string, userId: string) => {
  // প্রথোমে ইউজারকে খুঁজে বের করুন
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new Error('User not found');
  }

  // বর্তমান স্ট্যাটাসের উল্টোটা সেট হবে (true থাকলে false, false থাকলে true)
  const newBlockStatus = !existingUser.isBlocked;

  const user = await prisma.user.update({
    where: { id: userId },
    data: { isBlocked: newBlockStatus },
  });

  await prisma.auditLog.create({
    data: {
      userId: adminId, 
      entity: 'USER',
      action: newBlockStatus ? 'USER_BLOCKED' : 'USER_UNBLOCKED',
      details: `User ${user.email} was ${newBlockStatus ? 'blocked' : 'unblocked'}.`,
    },
  });

  return user;
};



const updateUserRoleInDB = async (adminId: string, userId: string, role: Role) => {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  await prisma.auditLog.create({
    data: {
      userId: adminId,
      entity: 'USER',
      action: 'USER_ROLE_UPDATED',
      details: `User ${updatedUser.email} role changed to ${role}.`,
    },
  });

  return updatedUser;
};

const updateBloodRequestStatusInDB = async (
  adminId: string,
  requestId: string,
  status: RequestStatus
) => {
  const updatedRequest = await prisma.bloodRequest.update({
    where: { id: requestId },
    data: { status },
  });

  await prisma.auditLog.create({
    data: {
      userId: adminId,
      entity: 'BLOOD_REQUEST', 
      action: `BLOOD_REQUEST_${status}`,
      details: `Blood request ${requestId} status updated to ${status}.`,
    },
  });

  return updatedRequest;
};

const getSystemReportFromDB = async () => {
  const totalUsers = await prisma.user.count();
  const totalDonors = await prisma.user.count({ where: { role: Role.DONOR } });
  const totalPatients = await prisma.user.count({ where: { role: Role.PATIENT } });
  const totalBloodRequests = await prisma.bloodRequest.count();
  const pendingRequests = await prisma.bloodRequest.count({
    where: { status: RequestStatus.PENDING },
  });
  const approvedRequests = await prisma.bloodRequest.count({
    where: { status: RequestStatus.APPROVED },
  });

  return {
    totalUsers,
    totalDonors,
    totalPatients,
    totalBloodRequests,
    pendingRequests,
    approvedRequests,
  };
};

const getAuditLogsFromDB = async () => {
  return await prisma.auditLog.findMany({
    include: {
      user: { 
        select: {
          fullName: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const AdminService = {
  getAllUsersFromDB,
  toggleUserBlockStatusInDB,
  updateUserRoleInDB,
  updateBloodRequestStatusInDB,
  getSystemReportFromDB,
  getAuditLogsFromDB,
};