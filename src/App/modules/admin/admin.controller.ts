import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendresponse.js';
import { AdminService } from './admin.service.js';

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllUsersFromDB();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Users retrieved successfully',
    data: result,
  });
});

const toggleUserBlockStatus = catchAsync(async (req: Request, res: Response) => {
  const adminId = req.user.id;
  const { userId } = req.params;
  const { isBlocked } = req.body;

  const result = await AdminService.toggleUserBlockStatusInDB(adminId, userId, isBlocked);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
    data: result,
  });
});

const updateUserRole = catchAsync(async (req: Request, res: Response) => {
  const adminId = req.user.id;
  const { userId } = req.params;
  const { role } = req.body;

  const result = await AdminService.updateUserRoleInDB(adminId, userId, role);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User role updated successfully',
    data: result,
  });
});

const updateBloodRequestStatus = catchAsync(async (req: Request, res: Response) => {
  const adminId = req.user.id;
  const { requestId } = req.params;
  const { status } = req.body; // 'APPROVED' or 'REJECTED'

  const result = await AdminService.updateBloodRequestStatusInDB(adminId, requestId, status);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Blood request ${status.toLowerCase()} successfully`,
    data: result,
  });
});

const getSystemReport = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getSystemReportFromDB();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'System report retrieved successfully',
    data: result,
  });
});

const getAuditLogs = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAuditLogsFromDB();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Audit logs retrieved successfully',
    data: result,
  });
});

export const AdminController = {
  getAllUsers,
  toggleUserBlockStatus,
  updateUserRole,
  updateBloodRequestStatus,
  getSystemReport,
  getAuditLogs,
};