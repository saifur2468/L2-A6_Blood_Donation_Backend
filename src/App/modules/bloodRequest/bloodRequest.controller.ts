import type { Response } from 'express';
import type { CustomRequest } from '../../middlewares/auth.js';
import { BloodRequestService } from './bloodRequest.service.js';

const createBloodRequest = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const patientId = req.user?.id;
    if (!patientId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const result = await BloodRequestService.createBloodRequestInDB(patientId, req.body);

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Blood donation request created successfully!',
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create blood request',
    });
  }
};

const getMyRequests = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const patientId = req.user?.id;
    if (!patientId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const result = await BloodRequestService.getMyRequestsFromDB(patientId);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'My blood requests fetched successfully!',
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch blood requests' });
  }
};

const cancelBloodRequest = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const patientId = req.user?.id;
    const { id } = req.params;

    if (!patientId || !id) {
      res.status(400).json({ success: false, message: 'Invalid Request Data' });
      return;
    }

    const result = await BloodRequestService.cancelBloodRequestInDB(id, patientId);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Blood request cancelled successfully!',
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to cancel request',
    });
  }
};

const completeBloodRequest = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const patientId = req.user?.id;
    const { id } = req.params;

    if (!patientId || !id) {
      res.status(400).json({ success: false, message: 'Invalid Request Data' });
      return;
    }

    const result = await BloodRequestService.completeBloodRequestInDB(id, patientId);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Blood request marked as completed!',
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to complete request',
    });
  }
};

export const BloodRequestController = {
  createBloodRequest,
  getMyRequests,
  cancelBloodRequest,
  completeBloodRequest,
};