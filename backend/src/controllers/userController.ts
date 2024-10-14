import { Request, Response } from "express";
import { userService } from "../services/userServices";

export const initiateSignUp = async (
  req: Request,
  res: Response
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
    console.error("Error during sign up initiation:", error);
    res.status(400).json({
      message: "User sign up initiation failed",
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
};

export const verifyOTPAndCreateUser = async (
  req: Request,
  res: Response
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
    console.error(error);
    res.status(400).json({
      message: "OTP verification failed",
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
};

export const signIn = async (req: Request, res: Response): Promise<void> => {
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
    console.error(error);
    res.status(401).json({
      message: "Authentication failed",
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.body;

  try {
    await userService.sendOTPForForgotPassword(email, res);
    res.status(200).json({
      message: "OTP sent for verification",
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      message: "Failed to send OTP",
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
};

export const verifyForgotOTP = async (
  req: Request,
  res: Response
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
    console.error(error);
    res.status(401).json({
      message: "Authentication failed",
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    await userService.Logout(res, req);
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Logout failed",
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
};
