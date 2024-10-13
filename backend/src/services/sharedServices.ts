// services/sharedServices.ts
import { generateOTP, sendOTP } from "../utils/otpUtils";
import PendingUser from "../models/pendingUserModel";
import User from "../models/usersModel";
import { Response, Request } from "express";
import { generateToken } from "../utils/jwtUtils";
import bcrypt from "bcryptjs";
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

  async sendForgotPasswordOTP(
    email: string,
    res: Response
  ): Promise<{ message: string }> {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Email not registered");
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const hashedOTP = await bcrypt.hash(otp, 10);

    res.cookie("resetOTP", hashedOTP, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 10 * 60 * 1000, // 10 minutes
      sameSite: "strict",
    });

    await sendOTP(email, otp);

    return {
      message: `OTP sent for password reset  ${otp}`,
    };
  }

  async resendForgotPasswordOTP(
    email: string,
    res: Response
  ): Promise<{ message: string }> {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Email not registered");
    }

    // Generate a new OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

    const hashedOTP = await bcrypt.hash(otp, 10); // Hash the new OTP

    // Overwrite the existing 'resetOTP' cookie with the new hashed OTP
    res.cookie("resetOTP", hashedOTP, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 10 * 60 * 1000,
      sameSite: "strict",
    });

    await sendOTP(email, otp);

    return {
      message: `A new OTP has been sent for password reset:  ${otp}`,
    };
  }

  async verifyForgotPasswordOTP(
    email: string,
    otp: string,
    req: Request,
    res: Response
  ): Promise<{ message: string }> {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Email not registered");
    }

    const storedHashedOTP = req.cookies.resetOTP; // Retrieve hashed OTP from the cookie

    if (!storedHashedOTP) {
      throw new Error("No OTP found");
    }

    // Compare the provided OTP with the hashed OTP
    const isMatch = await bcrypt.compare(otp, storedHashedOTP);
    if (!isMatch) {
      throw new Error("Invalid OTP");
    }

    res.clearCookie("resetOTP");

    const token = generateToken(user.id, user.role);
    res.cookie("user", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
    });

    return {
      message: "OTP verified successfully",
    };
  }
}
