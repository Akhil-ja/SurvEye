// controllers/otpController.ts
import { Request, Response } from "express";
import { SharedService } from "../services/sharedServices";

const sharedService = new SharedService();

export const resendOTP = async (req: Request, res: Response): Promise<void> => {
  const { pendingUserId } = req.body;

  try {
    const result = await sharedService.resendOTP(pendingUserId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error during OTP resend:", error);
    res.status(400).json({
      message: "Failed to resend OTP",
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    await sharedService.logout(res); // Use the instance method correctly
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({
      message: "Logout failed",
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
};
