import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { sendEmail } from '../../utils/sendEmail.js';  

const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await AuthService.registerUserInDB(req.body);

    // Email pathano: await dite hobe, but fail hole registration fail hobe na
    try {
      const userEmail = result.email || req.body.email;
      const userName = result.fullName || req.body.fullName || 'User';

      const subject = 'Registration Successful - Blood Donation App';
      const html = `
       <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8 text-center">
        
        {/* Success Icon */}
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful! </h2>
        <h1>${userName}<h1/>
        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
          Thank you so much for registering as a blood donor! Your willingness to donate blood can save precious lives.
        </p>

        {/* Details Box */}
        <div className="bg-gray-50 rounded-xl p-4 text-left border border-gray-200 space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="font-semibold text-gray-500">Donor Name:</span>
            <span className="text-gray-800 font-medium">Saifur Rahman</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-semibold text-gray-500">Blood Group:</span>
            <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded">A+</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-semibold text-gray-500">Donation Date:</span>
            <span className="text-gray-800 font-medium">15 Oct 2026</span>
          </div>
        </div>

        {/* Action Button */}
        <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition duration-200 shadow-md shadow-red-100">
          Go to Dashboard
        </button>

      </div>
    </div>
      `;

      await sendEmail(userEmail, subject, html); // <-- await add korun
      console.log('Registration email sent to:', userEmail);
    } catch (emailError) {
      console.error('Registration email FAILED:', emailError);
    }

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

// const loginUser = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const result = await AuthService.loginUser(req.body);
//     const { accessToken, refreshToken, user } = result;

//     res.cookie('refreshToken', refreshToken, {
//       secure: process.env.NODE_ENV === 'production',
//       httpOnly: true,
//     });

//     res.status(200).json({
//       success: true,
//       statusCode: 200,
//       message: 'User logged in successfully!',
//       data: { accessToken, user },
//     });
//   } catch (error) {
//     res.status(401).json({
//       success: false,
//       message: error instanceof Error ? error.message : 'Login failed',
//     });
//   }
// };


const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await AuthService.loginUser(req.body);
    const { accessToken, refreshToken, user } = result;

    res.cookie('refreshToken', refreshToken, {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'User logged in successfully!',
      data: { accessToken, user },
    });
  } catch (error: any) {
    // যদি মেসেজে 'blocked' থাকে, তবে 403 Forbidden রিটার্ন করুন
    const isBlockedError = error.message?.toLowerCase().includes('blocked');
    const statusCode = isBlockedError ? 403 : 401;

    res.status(statusCode).json({
      success: false,
      statusCode: statusCode,
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

const googleCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user as {
      id: string;
      email: string;
      role: string;
    };

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Google authentication failed',
      });
      return;
    }

    const { accessToken, refreshToken } = AuthService.issueTokensForUser(user);

    res.cookie('refreshToken', refreshToken, {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    });

    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${FRONTEND_URL}/oauth-success?token=${accessToken}`);
  } catch (error) {
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${FRONTEND_URL}/oauth-failed`);
  }
};






const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const result = await AuthService.forgotPasswordInDB(email);

    if (result) {
      try {
        const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
        const resetLink = `${FRONTEND_URL}/reset-password?token=${result.rawToken}`;

        const html = `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #eee;border-radius:12px">
            <h2 style="color:#111">Reset your password</h2>
            <p>Hi ${result.fullName},</p>
            <p>We received a request to reset your password. Click the button below. This link expires in 15 minutes.</p>
            <p style="text-align:center;margin:28px 0">
              <a href="${resetLink}" style="background:#dc2626;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">
                Reset Password
              </a>
            </p>
            <p style="color:#666;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
          </div>
        `;

        await sendEmail(result.email, 'Reset your password - Blood Donation App', html);
      } catch (emailError) {
        console.error('Reset email FAILED:', emailError);
      }
    }

    // Sob shomoy same response (email exist kore kina ta leak hobe na)
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'If an account exists with this email, a reset link has been sent.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Something went wrong',
    });
  }
};


const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    
    const { email, token, newPassword } = req.body;


    const result = await AuthService.resetPasswordInDB({ email, token, newPassword });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: result.message,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Password reset failed',
    });
  }
};


export const AuthController = {
  registerUser,
  loginUser,
  logoutUser,
  googleCallback,
  forgotPassword,
  resetPassword,
};