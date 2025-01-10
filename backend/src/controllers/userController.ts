import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/userServices';
import { AppError } from '../utils/AppError';
import moment from 'moment';

export const initiateSignUp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, phoneNumber, password, firstName, lastName, dateOfBirth } =
    req.body;

  try {
    const result = await userService.initiateSignUp({
      email,
      phoneNumber,
      password,
      role: 'user',
      firstName,
      lastName,
      dateOfBirth,
    });

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

export const verifyOTPAndCreateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { pendingUserId, otp } = req.body;

  try {
    const newUser = await userService.verifyOTPAndCreateUser(
      pendingUserId,
      otp,
      res
    );
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        created_at: newUser.created_at,
      },
    });
  } catch (error) {
    console.error('Error during OTP resend:', error);
    next(
      error instanceof AppError
        ? error
        : new AppError('Failed to send OTP', 400)
    );
  }
};

export const signIn = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, password } = req.body;

  try {
    const { user, tokens } = await userService.signIn(
      email,
      password,
      res,
      req
    );
    res.status(200).json({
      message: 'Sign in successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
      },
      tokens,
    });
  } catch (error) {
    console.error('Error during Sign-in:', error);
    next(
      error instanceof AppError ? error : new AppError('Failed to signin', 400)
    );
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email } = req.body;

  try {
    await userService.sendOTPForForgotPassword(email, res);
    res.status(200).json({
      message: 'OTP sent for verification',
    });
  } catch (error) {
    console.error('Error during OTP resend:', error);
    next(
      error instanceof AppError
        ? error
        : new AppError('Failed to resend OTP', 400)
    );
  }
};

export const verifyForgotOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, otp } = req.body;

  try {
    const { user, tokens } = await userService.verifyOTPAndSignIn(
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
        first_name: user.first_name,
        last_name: user.last_name,
      },
      tokens,
    });
  } catch (error) {
    console.error('Error during OTP verification:', error);
    next(
      error instanceof AppError
        ? error
        : new AppError('Failed to verify OTP', 400)
    );
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await userService.Logout(res, req);
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Error during logout:', error);
    next(new AppError('Logout failed', 500));
  }
};

export const fetchUserProfile = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('Authentication required', 401);
    }

    const userProfile = await userService.getProfile(userId);

    res.status(200).json({
      message: 'Profile fetched successfully',
      user: userProfile,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    next(
      error instanceof AppError
        ? error
        : new AppError('Profile fetch failed', 500)
    );
  }
};

export const editUserProfile = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('Authentication required', 401);
    }

    const { firstName, lastName, dateOfBirth, occupation } = req.body;

    if (!firstName && !lastName && !dateOfBirth && !occupation) {
      throw new AppError('No updates provided', 400);
    }

    const updatedUser = await userService.editProfile(userId, {
      firstName,
      lastName,
      dateOfBirth,
      occupation,
    });

    const age = updatedUser.date_of_birth
      ? moment().diff(moment(updatedUser.date_of_birth), 'years')
      : null;

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        number: updatedUser.phoneNumber,
        role: updatedUser.role,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        age: age,
        occupation: updatedUser.occupation,
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

export const changePasswordController = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('Authentication required', 401);
    }

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      throw new AppError('Both old and new passwords are required', 400);
    }

    const updatedUser = await userService.changePassword(userId, {
      oldPassword,
      newPassword,
    });

    res.status(200).json({
      message: 'Password updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        number: updatedUser.phoneNumber,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
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

export const getActiveSurveys = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 6;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const order = (req.query.order as 'asc' | 'desc') || 'desc';
    const attended = req.query.attended === 'true';
    const userId = req.user?.id;

    if (attended && !userId) {
      throw new AppError(
        'Authentication required to view attended surveys',
        401
      );
    }

    const result = await userService.getActiveSurveys(
      page,
      limit,
      sortBy,
      order,
      attended,
      userId
    );

    res.status(200).json({
      status: 'success',
      data: {
        surveys: result.surveys,
        pagination: {
          currentPage: result.currentPage,
          totalPages: result.totalPages,
          totalSurveys: result.totalSurveys,
        },
      },
    });
  } catch (error) {
    next(
      error instanceof AppError
        ? error
        : new AppError('Failed to fetch surveys', 500)
    );
  }
};

export const getSurveyinfo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const surveyId = req.query.surveyId;
    if (typeof surveyId !== 'string') {
      throw new AppError('Invalid survey ID format', 400);
    }
    const result = await userService.getSurveyinfo(surveyId);

    if (!result.survey) {
      throw new AppError('Survey not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: {
        survey: result.survey,
      },
    });
  } catch (error) {
    next(
      error instanceof AppError
        ? error
        : new AppError('Failed to fetch survey', 500)
    );
  }
};

export const submitSurveyResponse = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { surveyId } = req.params;
    const { responses } = req.body;

    if (!userId) {
      throw new AppError('Authentication required', 401);
    }

    if (!responses || !Array.isArray(responses)) {
      throw new AppError('Invalid submission data', 400);
    }

    const result = await userService.submitResponse(
      surveyId,
      userId,
      responses
    );

    res.status(201).json({
      status: 'success',
      message: 'Survey response submitted successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error submitting survey response:', error);
    next(
      error instanceof AppError
        ? error
        : new AppError('Failed to submit survey response', 500)
    );
  }
};

export const getAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { isActive } = req.params;
    const active = isActive === 'true';

    const categories = await userService.getAllCategories(active);
    res.status(200).json({
      message: 'Categories fetched successfully',
      categories,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    next(new AppError('Failed to fetch users', 500));
  }
};

export const sendSOLToken = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { senderPrivateKey, recipientPublicAddress, amountInSol } = req.body;

    const transactionSignature = await userService.sendSOL(
      senderPrivateKey,
      recipientPublicAddress,
      amountInSol,
      userId
    );

    res.status(200).json({
      message: 'SOL transfer successful',
      transactionSignature,
    });
  } catch (error) {
    console.error('Error sending SOL:', error);

    if (
      error instanceof Error &&
      error.message.includes('Insufficient balance')
    ) {
      next(new AppError(error.message, 400));
    } else {
      next(new AppError('Failed to Send SOL', 500));
    }
  }
};

export const payoutToWallet = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log('payoutToWallet');

    const userId = req.user?.id;

    const transactionSignature = await userService.payout(userId);

    res.status(200).json({
      message: 'SOL transfer successful',
      transactionSignature,
    });
  } catch (error) {
    console.error('Error sending SOL:', error);

    if (
      error instanceof Error &&
      error.message.includes('Insufficient balance')
    ) {
      next(new AppError(error.message, 400));
    } else {
      next(new AppError('Failed to Send SOL', 500));
    }
  }
};
