// services/sharedServices.ts
import { generateOTP, sendOTP } from "../utils/otpUtils";
import PendingUser from "../models/pendingUserModel";
import { Response } from "express";

export class SharedService {
  async resendOTP(
    pendingUserId: string
  ): Promise<{ message: string; otp: string }> {
    // Find the pending user by ID
    const pendingUser = await PendingUser.findById(pendingUserId);
    if (!pendingUser) {
      throw new Error("Pending user not found");
    }

    // Generate a new OTP
    const newOtp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiration

    pendingUser.otp = newOtp;
    pendingUser.otpExpires = otpExpires;

    await pendingUser.save();
    await sendOTP(pendingUser.email, newOtp); // Send the new OTP via email

    return {
      message: "New OTP sent for verification",
      otp: newOtp, // Optionally return the OTP for debugging (remove in production)
    };
  }

  async logout(res: Response): Promise<void> {
    console.log("Logging out...");

    await res.clearCookie("user", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
  }
}
