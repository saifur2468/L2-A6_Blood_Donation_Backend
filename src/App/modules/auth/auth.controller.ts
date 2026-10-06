// import type { Request, Response } from 'express';
// import { AuthService } from './auth.service.js';

// const registerUser = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const result = await AuthService.registerUserInDB(req.body);
//     res.status(201).json({
//       success: true,
//       statusCode: 201,
//       message: 'User registered successfully!',
//       data: result,
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       message: error instanceof Error ? error.message : 'Registration failed',
//     });
//   }
// };

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

// const logoutUser = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const authHeader = req.headers.authorization;
//     const { email } = req.body;

//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       res.status(401).json({
//         success: false,
//         message: 'Unauthorized! Token is missing or invalid.',
//       });
//       return;
//     }

//     if (!email) {
//       res.status(400).json({
//         success: false,
//         message: 'Email is required in request body.',
//       });
//       return;
//     }

//     const token = authHeader.split(' ')[1];
//     const result = await AuthService.logoutUser(token, email);

//     res.clearCookie('refreshToken', {
//       secure: process.env.NODE_ENV === 'production',
//       httpOnly: true,
//     });

//     res.status(200).json({
//       success: true,
//       statusCode: 200,
//       message: result.message,
//     });
//   } catch (error) {
//     res.status(401).json({
//       success: false,
//       message: error instanceof Error ? error.message : 'Logout failed!',
//     });
//   }
// };


// const googleCallback = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const user = req.user as {
//       id: string;
//       email: string;
//       role: string;
//     };

//     if (!user) {
//       res.status(401).json({
//         success: false,
//         message: 'Google authentication failed',
//       });
//       return;
//     }

//     const { accessToken, refreshToken } = AuthService.issueTokensForUser(user);

//     res.cookie('refreshToken', refreshToken, {
//       secure: process.env.NODE_ENV === 'production',
//       httpOnly: true,
//     });

//     const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
//     res.redirect(`${clientUrl}/oauth-success?token=${accessToken}`);
//   } catch (error) {
//     const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
//     res.redirect(`${clientUrl}/oauth-failed`);
//   }
// };

// export const AuthController = {
//   registerUser,
//   loginUser,
//   logoutUser,
//   googleCallback,
// };





























import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { sendEmail } from '../../utils/sendEmail.js'; // তোমার প্রজেক্টের পাথ অনুযায়ী ঠিক করে নিও

const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await AuthService.registerUserInDB(req.body);

    // Email pathano: await dite hobe, but fail hole registration fail hobe na
    try {
      const userEmail = result.email || req.body.email;
      const userName = result.fullName || req.body.fullName || 'User';

      const subject = 'Registration Successful - Blood Donation App';
      const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #dc2626;">Congratulation, ${userName}! 🎉</h2>
          <p>You have successfully registered on our <b>Blood Donation</b> platform.</p>
          <p>Thank you for joining us to save lives. You can now login and start making or accepting blood requests.</p>
          <br/>
          <p>Best regards,</p>
          <p><b>Blood Donation Team</b></p>
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

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    res.redirect(`${clientUrl}/oauth-success?token=${accessToken}`);
  } catch (error) {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    res.redirect(`${clientUrl}/oauth-failed`);
  }
};

export const AuthController = {
  registerUser,
  loginUser,
  logoutUser,
  googleCallback,
};