import { Request, Response } from "express";
import { creatorService } from "../services/creatorServices";

export const initiateSignUp = async (
  req: Request,
  res: Response
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
    console.error("Error during sign up initiation:", error);

    // Return generic message to client, logging actual error on the server
    res.status(400).json({
      message: "Creator sign up initiation failed",
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
};

export const verifyOTPAndCreateCreator = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { pendingUserId, otp } = req.body;

  try {
    const newCreator = await creatorService.verifyOTPAndCreateCreator(
      pendingUserId,
      otp
    );

    res.status(201).json({
      message: "Creator created successfully",
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
    await creatorService.sendOTPForForgotPassword(email, res);
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
    await creatorService.Logout(res);
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
