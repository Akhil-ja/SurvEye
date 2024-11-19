import { Request, Response, NextFunction } from 'express';
import { SharedService } from '../services/sharedServices';
import { AppError } from '../utils/AppError';
import HTTP_statusCode from '../Enums/httpStatusCode';

const sharedService = new SharedService();

export const resendOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { pendingUserId } = req.body;

  try {
    const result = await sharedService.resendOTP(pendingUserId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error during OTP resend:', error);
    next(
      error instanceof AppError
        ? error
        : new AppError('Failed to resend OTP', 400)
    );
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await sharedService.logout(res);
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Error during logout:', error);
    next(
      error instanceof AppError ? error : new AppError('Logout failed', 500)
    );
  }
};

export const forgotPasswordSendOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email } = req.body;

  try {
    const result = await sharedService.sendForgotPasswordOTP(email, res);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error during forgot password OTP send:', error);
    next(
      error instanceof AppError
        ? error
        : new AppError('Failed to send OTP', 400)
    );
  }
};

export const resendForgotPasswordSendOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email } = req.body;

  try {
    const result = await sharedService.resendForgotPasswordOTP(email, res);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error during forgot password OTP send:', error);
    next(
      error instanceof AppError
        ? error
        : new AppError('Failed to resend OTP', 400)
    );
  }
};

export const verifyForgotPasswordOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, otp } = req.body;

  try {
    const result = await sharedService.verifyForgotPasswordOTP(
      email,
      otp,
      req,
      res
    );
    res.status(200).json(result);
  } catch (error) {
    console.error('Error during OTP verification:', error);
    next(
      error instanceof AppError
        ? error
        : new AppError('OTP verification failed', 400)
    );
  }
};

export const googleAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, displayName, role } = req.body;

  try {
    const { user, tokens } = await sharedService.googleAuth({
      email,
      displayName,
      role,
      res,
    });

    // Send response back to client
    res.status(200).json({
      status: 'success',
      message: 'Authentication successful',
      user,
      tokens,
    });
  } catch (error) {
    console.error('Error during Google authentication:', error);

    next(
      error instanceof AppError
        ? error
        : new AppError('Authentication failed', 500)
    );
  }
};
