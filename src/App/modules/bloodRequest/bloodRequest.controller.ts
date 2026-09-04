import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js'; 
import { BloodRequestService } from './bloodRequest.service.js';



const createBloodRequest = catchAsync(async (req: Request, res: Response) => {
  const patientId = req.user.id;
  const result = await BloodRequestService.createBloodRequestInDB(patientId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Blood request created successfully!',
    data: result,
  });
});

const getMyRequests = catchAsync(async (req: Request, res: Response) => {
  const patientId = req.user.id;
  const result = await BloodRequestService.getMyRequestsFromDB(patientId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'My blood requests retrieved successfully!',
    data: result,
  });
});

const updateMyRequest = catchAsync(async (req: Request, res: Response) => {
  const patientId = req.user.id;
  const { id } = req.params;
  const result = await BloodRequestService.updateMyRequestInDB(patientId, id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Blood request updated successfully!',
    data: result,
  });
});

const deleteMyRequest = catchAsync(async (req: Request, res: Response) => {
  const patientId = req.user.id;
  const { id } = req.params;
  const result = await BloodRequestService.deleteMyRequestInDB(patientId, id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Blood request deleted successfully!',
    data: result,
  });
});



const getAllPendingRequests = catchAsync(async (req: Request, res: Response) => {
  const result = await BloodRequestService.getAllPendingRequestsFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Pending blood requests retrieved successfully!',
    data: result,
  });
});

const acceptBloodRequest = catchAsync(async (req: Request, res: Response) => {
  const donorId = req.user.id;
  const { id: requestId } = req.params;

  const result = await BloodRequestService.acceptBloodRequestInDB(requestId, donorId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Blood request accepted successfully!',
    data: result,
  });
});

export const BloodRequestController = {
  createBloodRequest,
  getMyRequests,
  updateMyRequest,
  deleteMyRequest,
  getAllPendingRequests,
  acceptBloodRequest, 
};