import { Request, Response, NextFunction } from "express";
import { userService } from "../services/userServices";
import { AppError } from "../utils/AppError"; // Import AppError

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
      role: "user",
      firstName,
      lastName,
      dateOfBirth,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error during OTP resend:", error);
    next(
      error instanceof AppError
        ? error
        : new AppError("Failed to resend OTP", 400)
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
      message: "User created successfully",
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
    console.error("Error during OTP resend:", error);
    next(
      error instanceof AppError
        ? error
        : new AppError("Failed to send OTP", 400)
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
    const { user, token } = await userService.signIn(email, password, res, req);
    res.status(200).json({
      message: "Sign in successful",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
      },
      token,
    });
  } catch (error) {
    console.error("Error during Sign-in:", error);
    next(
      error instanceof AppError ? error : new AppError("Failed to signin", 400)
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
      message: "OTP sent for verification",
    });
  } catch (error) {
    console.error("Error during OTP resend:", error);
    next(
      error instanceof AppError
        ? error
        : new AppError("Failed to resend OTP", 400)
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
    const { user, token } = await userService.verifyOTPAndSignIn(
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
        first_name: user.first_name,
        last_name: user.last_name,
      },
      token,
    });
  } catch (error) {
    console.error("Error during OTP verification:", error);
    next(
      error instanceof AppError
        ? error
        : new AppError("Failed to verify OTP", 400)
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
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error during logout:", error);
    next(new AppError("Logout failed", 500));
  }
};
