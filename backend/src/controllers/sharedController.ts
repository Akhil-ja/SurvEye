import { Request, Response, NextFunction } from 'express';
import { SharedService } from '../services/sharedServices';
import { AppError } from '../utils/AppError';
import HTTP_statusCode from '../Enums/httpStatusCode';

export class SharedController {
  constructor(private readonly sharedService: SharedService) {}

  resendOTP = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { pendingUserId } = req.body;

    try {
      const result = await this.sharedService.resendOTP(pendingUserId);
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

  logout = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await this.sharedService.logout(res);
      res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
      console.error('Error during logout:', error);
      next(
        error instanceof AppError ? error : new AppError('Logout failed', 500)
      );
    }
  };

  forgotPasswordSendOTP = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { email } = req.body;

    try {
      const result = await this.sharedService.sendForgotPasswordOTP(email, res);
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

  resendForgotPasswordSendOTP = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { email } = req.body;

    try {
      const result = await this.sharedService.resendForgotPasswordOTP(
        email,
        res
      );
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

  verifyForgotPasswordOTP = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { email, otp } = req.body;

    try {
      const result = await this.sharedService.verifyForgotPasswordOTP(
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

  googleAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { email, displayName } = req.body;

    console.log(email, displayName);

    try {
      const { user, tokens } = await this.sharedService.googleAuth({
        email,
        displayName,
        res,
      });

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

  createAndStoreWallet = async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Authentication required', 401);
      }

      const wallet = await this.sharedService.createWallet(userId);

      res.status(201).json({
        message: 'Wallet created successfully',
        publicAddress: wallet.publicAddress,
      });
    } catch (error) {
      next(error);
    }
  };

  AddExistingWallet = async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { publicAddress, privateKey } = req.body;
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('Authentication required', 401);
      }
      const wallet = await this.sharedService.addExistingWallet(
        userId,
        publicAddress,
        privateKey
      );
      res.status(201).json({
        message: 'Wallet added successfully',
        publicAddress: wallet.publicAddress,
      });
    } catch (error) {
      console.error('Error creating wallet:', error);
      next(new AppError('Failed to create wallet', 500));
    }
  };

  getWallet = async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return next(new AppError('User ID not provided', 400));
      }

      const wallet = await this.sharedService.getWallet(userId);

      if (!wallet) {
        res.status(200).json({
          message: 'No wallet found for the user',
          wallet: null,
        });
        return;
      }

      res.status(200).json({
        message: 'Fetched wallet successfully',
        wallet,
      });
    } catch (error) {
      console.error('Error fetching wallet:', error);
      next(new AppError('Failed to fetch wallet', 500));
    }
  };

  getTransactions = async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return next(new AppError('User ID not provided', 400));
      }

      const transactions = await this.sharedService.getTransactions(userId);

      if (!transactions) {
        res.status(200).json({
          message: 'No transactions found for the user',
          wallet: null,
        });
        return;
      }

      res.status(200).json({
        message: 'Fetched transactions successfully',
        transactions,
      });
    } catch (error) {
      console.error('Error fetching wallet:', error);
      next(new AppError('Failed to fetch wallet', 500));
    }
  };

  makeTransaction = async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id;

      const { amount, type, status, sender, recipient, signature } = req.body;

      if (!userId) {
        return next(new AppError('User ID not provided', 400));
      }

      if (!amount || !type || !status) {
        return next(new AppError('Missing required fields', 400));
      }

      const transaction = await this.sharedService.makeTransaction(
        userId,
        amount,
        type,
        status,
        sender,
        recipient,
        signature
      );

      if (!transaction) {
        res.status(400).json({
          message: 'Failed to create transaction',
        });
        return;
      }

      res.status(201).json({
        message: 'Transaction created successfully',
        transaction,
      });
    } catch (error) {
      console.error('Error creating transaction:', error);
      next(new AppError('Failed to create transaction', 500));
    }
  };
}
