import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';

const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await AuthService.registerUserInDB(req.body);
    res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'User registered successfully!',
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Registration failed',
    });
  }
};

const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await AuthService.loginUser(req.body);
    const { accessToken, refreshToken } = result;

    res.cookie('refreshToken', refreshToken, {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'User logged in successfully!',
      data: { accessToken },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error instanceof Error ? error.message : 'Login failed',
    });
  }
};

const logoutUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const { email } = req.body;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized! Token is missing or invalid.',
      });
      return;
    }

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email is required in request body.',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const result = await AuthService.logoutUser(token, email);

    res.clearCookie('refreshToken', {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: result.message,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error instanceof Error ? error.message : 'Logout failed!',
    });
  }
};

export const AuthController = {
  registerUser,
  loginUser,
  logoutUser,
};