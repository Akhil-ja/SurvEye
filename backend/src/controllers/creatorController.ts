import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { CreatorService } from '../services/creatorServices';
import { IIncomingSurveyData } from '../types/surveyTypes';
import HTTP_statusCode from '../Enums/httpStatusCode';
import mongoose from 'mongoose';

export class CreatorController {
  constructor(private readonly CreatorService: CreatorService) {}

  // Initiate Sign Up
  initiateSignUp = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { email, phoneNumber, password, creatorName, industry } = req.body;

    try {
      const result = await this.CreatorService.initiateSignUp({
        email,
        phoneNumber,
        password,
        creatorName,
        industry,
      });

      res.status(200).json(result);
    } catch (error) {
      console.error('Error during sign-up initiation:', error);
      next(
        error instanceof AppError
          ? error
          : new AppError('Signup failed', HTTP_statusCode.InternalServerError)
      );
    }
  };

  // Verify OTP and Create Creator
  verifyOTPAndCreateCreator = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { pendingUserId, otp } = req.body;

    try {
      const newCreator = await this.CreatorService.verifyOTPAndCreateCreator(
        pendingUserId,
        otp,
        res
      );

      res.status(201).json({
        message: 'Creator sign-up successfully',
        user: {
          id: newCreator.id,
          email: newCreator.email,
          phoneNumber: newCreator.phoneNumber,
          creator_name: newCreator.creator_name,
          industry: newCreator.industry,
          created_at: newCreator.created_at,
          role: 'creator',
        },
      });
    } catch (error) {
      console.error('Error during OTP verification:', error);
      next(
        error instanceof AppError
          ? error
          : new AppError(
              'OTP verification failed',
              HTTP_statusCode.InternalServerError
            )
      );
    }
  };

  // Sign In
  signIn = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { email, password } = req.body;

    try {
      const { user, tokens } = await this.CreatorService.signIn(
        email,
        password,
        res,
        req
      );

      res.status(HTTP_statusCode.OK).json({
        message: 'Sign in successful',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          creator_name: user.creator_name,
        },
        tokens,
      });
    } catch (error) {
      console.error('Error during sign-in:', error);
      next(
        new AppError(
          error instanceof Error ? error.message : 'Sign in failed',
          HTTP_statusCode.Unauthorized
        )
      );
    }
  };

  // Forgot Password
  forgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { email } = req.body;

    try {
      await this.CreatorService.sendOTPForForgotPassword(email, res);
      res.status(200).json({
        message: 'OTP sent for password reset',
      });
    } catch (error) {
      console.error('Error during OTP sending:', error);
      next(
        error instanceof AppError
          ? error
          : new AppError(
              'OTP sending failed',
              HTTP_statusCode.InternalServerError
            )
      );
    }
  };

  // Verify Forgot Password OTP
  verifyForgotOTP = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { email, otp } = req.body;

    try {
      const { user, tokens } = await this.CreatorService.verifyOTPAndSignIn(
        email,
        otp,
        res,
        req
      );

      res.status(200).json({
        message: 'Sign in successful',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          creator_name: user.creator_name,
        },
        tokens,
      });
    } catch (error) {
      console.error('Error during OTP verification:', error);
      next(
        error instanceof AppError
          ? error
          : new AppError(
              'OTP verification failed',
              HTTP_statusCode.InternalServerError
            )
      );
    }
  };

  fetchCreatorProfile = async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError(
          'Authentication required',
          HTTP_statusCode.Unauthorized
        );
      }

      const creatorProfile = await this.CreatorService.getProfile(userId);

      res.status(200).json({
        message: 'Profile fetched successfully',
        user: creatorProfile,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      next(
        error instanceof AppError
          ? error
          : new AppError(
              'Profile fetch failed',
              HTTP_statusCode.InternalServerError
            )
      );
    }
  };

  editCreatorProfile = async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      console.log('in edid profile');

      const userId = req.user?.id;
      console.log('userid:', userId);

      if (!userId) {
        throw new AppError('Authentication required', 401);
      }

      const { creator_name, industry } = req.body;

      if (!creator_name && !industry) {
        throw new AppError('No updates provided', 400);
      }

      const updatedCreator = await this.CreatorService.editProfile(userId, {
        creator_name,
        industry,
      });

      res.status(200).json({
        message: 'Profile updated successfully',
        user: {
          id: updatedCreator.id,
          email: updatedCreator.email,
          number: updatedCreator.phoneNumber,
          role: updatedCreator.role,
          creator_name: updatedCreator.creator_name,
          industry: updatedCreator.industry,
        },
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      next(
        error instanceof AppError
          ? error
          : new AppError('Profile update failed', 500)
      );
    }
  };

  changePasswordController = async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      console.log('In change password');

      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Authentication required', 401);
      }

      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        throw new AppError('Both old and new passwords are required', 400);
      }

      const updatedCreator = await this.CreatorService.changePassword(userId, {
        oldPassword,
        newPassword,
      });

      res.status(200).json({
        message: 'Password updated successfully',
        user: {
          id: updatedCreator.id,
          email: updatedCreator.email,
          role: updatedCreator.role,
          number: updatedCreator.phoneNumber,
          creator_name: updatedCreator.creator_name,
          industry: updatedCreator.industry,
        },
      });
    } catch (error) {
      console.error('Error changing password:', error);
      next(
        error instanceof AppError
          ? error
          : new AppError('Password update failed', 500)
      );
    }
  };

  createSurvey = async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const creatorId = req.user?.id;

      if (!creatorId) {
        throw new AppError('Authentication required', 401);
      }

      const {
        surveyName,
        description,
        categories,
        creatorName,
        sampleSize,
        targetAgeRange,
        duration,
        questions,
        occupations,
        isAllOccupations,
      } = req.body;

      console.log('all occupations:', isAllOccupations);

      if (!Array.isArray(categories) || categories.length === 0) {
        throw new AppError('At least one category is required', 400);
      }

      if (
        !isAllOccupations &&
        (!Array.isArray(occupations) || occupations.length === 0)
      ) {
        throw new AppError(
          'At least one occupation is required when not selecting all occupations',
          400
        );
      }

      const survey = await this.CreatorService.createSurvey(creatorId, {
        surveyName,
        description,
        categories,
        creatorName,
        sampleSize,
        targetAgeRange,
        duration,
        questions,
        occupations,
        isAllOccupations,
      });

      res.status(200).json({
        message: 'Survey created successfully',
        survey,
      });
    } catch (error) {
      console.error('Error creating survey:', error);
      next(
        error instanceof AppError
          ? error
          : new AppError('Survey creation failed', 500)
      );
    }
  };

  getSurvey = async (
    req: Request<{ surveyId?: string | string[] }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const surveyId = req.query.surveyId;

      if (!surveyId || typeof surveyId !== 'string') {
        throw new AppError('Survey ID required', 400);
      }

      const survey = await this.CreatorService.getSurvey(surveyId);

      res.status(200).json({
        success: true,
        data: survey,
      });
    } catch (error) {
      console.error(
        'Error fetching survey:',
        error instanceof Error ? error.message : 'Unknown error'
      );
      next(
        error instanceof AppError
          ? error
          : new AppError('Failed to fetch survey', 500)
      );
    }
  };

  getAllSurveys = async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const creatorId = req.user.id;

      const { surveys } = await this.CreatorService.getAllSurveys(creatorId);

      res.status(200).json({
        success: true,
        data: surveys,
      });
    } catch (error) {
      console.error(
        'Error fetching surveys:',
        error instanceof Error ? error.message : 'Unknown error'
      );
      next(
        error instanceof AppError
          ? error
          : new AppError('Failed to fetch surveys', 500)
      );
    }
  };

  makeSurvey = async (
    req: Request<{}, any, IIncomingSurveyData & { actionType: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { actionType, price, ...surveyData } = req.body;

      if (!surveyData || !surveyData.pages) {
        throw new AppError('Survey data missing', 400);
      }

      if (!Array.isArray(surveyData.pages)) {
        throw new AppError('Invalid survey data format', 400);
      }

      const survey = await this.CreatorService.makeSurvey(
        surveyData,
        actionType,
        price
      );

      res.status(200).json({
        success: true,
        data: survey,
      });
    } catch (error) {
      console.error(
        'Error creating/updating survey:',
        error instanceof Error ? error.message : 'Unknown error'
      );
      next(
        error instanceof AppError
          ? error
          : new AppError('Failed to create/update survey', 500)
      );
    }
  };

  publishSurvey = async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { surveyId } = req.query;

      if (!surveyId) {
        throw new AppError('Survey ID is required', 400);
      }

      const survey = await this.CreatorService.publishSurvey(surveyId);

      res.status(200).json({
        success: true,
        data: survey,
      });
    } catch (error) {
      console.error(
        'Error publishing survey:',
        error instanceof Error ? error.message : 'Unknown error'
      );
      next(
        error instanceof AppError
          ? error
          : new AppError('Failed to publish survey', 500)
      );
    }
  };

  surveyAnalytics = async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const surveyId = req.params.surveyId;
      const analytics = await this.CreatorService.getSurveyAnalytics(surveyId);

      res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      console.error(
        'Error publishing survey:',
        error instanceof Error ? error.message : 'Unknown error'
      );
      next(
        error instanceof AppError
          ? error
          : new AppError('Failed to get survey Analytics', 500)
      );
    }
  };

  getNotifications = async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const creatorId = req.user.id;

      const { notifications } =
        await this.CreatorService.getNotifications(creatorId);

      res.status(200).json({
        success: true,
        notifications: notifications,
      });
    } catch (error) {
      console.error(
        'Error fetching notifications:',
        error instanceof Error ? error.message : 'Unknown error'
      );
      next(
        error instanceof AppError
          ? error
          : new AppError('Failed to fetch notifications', 500)
      );
    }
  };
}
