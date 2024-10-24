import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { creatorService } from "../services/creatorServices";

// Initiate Sign Up
export const initiateSignUp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, phoneNumber, password, creatorName, industry } = req.body;

  try {
    const result = await creatorService.initiateSignUp({
      email,
      phoneNumber,
      password,
      creatorName,
      industry,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error during sign-up initiation:", error);
    next(
      error instanceof AppError ? error : new AppError("Signup failed", 500)
    );
  }
};

// Verify OTP and Create Creator
export const verifyOTPAndCreateCreator = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { pendingUserId, otp } = req.body;

  try {
    const newCreator = await creatorService.verifyOTPAndCreateCreator(
      pendingUserId,
      otp,
      res
    );

    res.status(201).json({
      message: "Creator sign-up successfully",
      creator: {
        id: newCreator.id,
        email: newCreator.email,
        phoneNumber: newCreator.phoneNumber,
        creator_name: newCreator.creator_name,
        industry: newCreator.industry,
        created_at: newCreator.created_at,
      },
    });
  } catch (error) {
    console.error("Error during OTP verification:", error);
    next(
      error instanceof AppError
        ? error
        : new AppError("OTP verification failed", 500)
    );
  }
};

// Sign In
export const signIn = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, password } = req.body;

  try {
    const { user, token } = await creatorService.signIn(
      email,
      password,
      res,
      req
    );

    res.status(200).json({
      message: "Sign in successful",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        creator_name: user.creator_name,
      },
      token,
    });
  } catch (error) {
    console.error("Error during sign-in:", error);
    next(
      new AppError(
        error instanceof Error ? error.message : "Sign in failed",
        401
      )
    );
  }
};

// Forgot Password
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email } = req.body;

  try {
    await creatorService.sendOTPForForgotPassword(email, res);
    res.status(200).json({
      message: "OTP sent for password reset",
    });
  } catch (error) {
    console.error("Error during OTP sending:", error);
    next(
      error instanceof AppError
        ? error
        : new AppError("OTP sending failed", 500)
    );
  }
};

// Verify Forgot Password OTP
export const verifyForgotOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, otp } = req.body;

  try {
    const { user, token } = await creatorService.verifyOTPAndSignIn(
      email,
      otp,
      res,
      req
    );

    res.status(200).json({
      message: "Sign in successful",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        creator_name: user.creator_name,
      },
      token,
    });
  } catch (error) {
    console.error("Error during OTP verification:", error);
    next(
      error instanceof AppError
        ? error
        : new AppError("OTP verification failed", 500)
    );
  }
};

export const fetchCreatorProfile = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Authentication required", 401);
    }

    const creatorProfile = await creatorService.getProfile(userId);

    res.status(200).json({
      message: "Profile fetched successfully",
      user: creatorProfile,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    next(
      error instanceof AppError
        ? error
        : new AppError("Profile fetch failed", 500)
    );
  }
};

export const editCreatorProfile = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log("in edid profile");

    const userId = req.user?.id;
    console.log("userid:", userId);

    if (!userId) {
      throw new AppError("Authentication required", 401);
    }

    const { creator_name, industry } = req.body;

    if (!creator_name && !industry) {
      throw new AppError("No updates provided", 400);
    }

    const updatedCreator = await creatorService.editProfile(userId, {
      creator_name,
      industry,
    });

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedCreator.id,
        email: updatedCreator.email,
        role: updatedCreator.role,
        creator_name: updatedCreator.creator_name,
        industry: updatedCreator.industry,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    next(
      error instanceof AppError
        ? error
        : new AppError("Profile update failed", 500)
    );
  }
};

export const changePasswordController = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log("In change password");

    const userId = req.user?.id;
    console.log("User ID:", userId);

    if (!userId) {
      throw new AppError("Authentication required", 401);
    }

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      throw new AppError("Both old and new passwords are required", 400);
    }

    const updatedCreator = await creatorService.changePassword(userId, {
      oldPassword,
      newPassword,
    });

    res.status(200).json({
      message: "Password updated successfully",
      user: {
        id: updatedCreator.id,
        email: updatedCreator.email,
        role: updatedCreator.role,
        creator_name: updatedCreator.creator_name,
        industry: updatedCreator.industry,
      },
    });
  } catch (error) {
    console.error("Error changing password:", error);
    next(
      error instanceof AppError
        ? error
        : new AppError("Password update failed", 500)
    );
  }
};
