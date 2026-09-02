import type { Response } from 'express';
import type { CustomRequest } from '../../middlewares/auth.js';
import { UserService } from './user.service.js';


const getMyProfile = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;

    if (!user?.id) {
      res.status(401).json({
        success: false,
        statusCode: 401,
        message: 'Unauthorized access!',
      });
      return;
    }

    const result = await UserService.getMyProfileFromDB(user.id);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Profile retrieved successfully!',
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to retrieve profile!',
    });
  }
};


const updateMyProfile = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;

    if (!user?.id) {
      res.status(401).json({
        success: false,
        statusCode: 401,
        message: 'Unauthorized access!',
      });
      return;
    }

    const result = await UserService.updateMyProfileInDB(user.id, req.body);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'User profile updated successfully!',
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update profile!',
    });
  }
};

export const UserController = {
  getMyProfile,
  updateMyProfile,
};