import { generateOTP, sendOTP } from "../utils/otpUtils";
import PendingUser from "../models/pendingUserModel";
import User from "../models/usersModel";
import { Response, Request } from "express";
import { generateToken } from "../utils/jwtUtils";
import bcrypt from "bcryptjs";
import { IUser } from "../models/usersModel";
import { AppError } from "../utils/AppError";

export class SharedService {
  // Resend OTP for pending users
  async resendOTP(
    pendingUserId: string
  ): Promise<{ message: string; otp: string }> {
    const pendingUser = await PendingUser.findById(pendingUserId);
    if (!pendingUser) {
      throw new AppError("Pending user not found", 404);
    }

    const newOtp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    pendingUser.otp = newOtp;
    pendingUser.otpExpires = otpExpires;

    await pendingUser.save();
    await sendOTP(pendingUser.email, newOtp);

    return {
      message: "New OTP sent for verification",
      otp: newOtp,
    };
  }

  // Logout user
  async logout(res: Response): Promise<void> {
    console.log("Logging out...");

    res.clearCookie("user", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
  }

  // Send OTP for password reset
  async sendForgotPasswordOTP(
    email: string,
    res: Response
  ): Promise<{ message: string }> {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError("Email not registered", 404);
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const hashedOTP = await bcrypt.hash(otp, 10);

    res.cookie("resetOTP", hashedOTP, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 10 * 60 * 1000,
      sameSite: "strict",
    });

    await sendOTP(email, otp);
    console.log(`The forgot password OTP is ${otp}`);
    return {
      message: `OTP sent for password reset`,
    };
  }

  // Resend OTP for password reset
  async resendForgotPasswordOTP(
    email: string,
    res: Response
  ): Promise<{ message: string }> {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError("Email not registered", 404);
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const hashedOTP = await bcrypt.hash(otp, 10);

    res.cookie("resetOTP", hashedOTP, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 10 * 60 * 1000,
      sameSite: "strict",
    });

    await sendOTP(email, otp);
    console.log(`The forgot password OTP is ${otp}`);

    return {
      message: `A new OTP has been sent for password reset`,
    };
  }

  // Verify OTP for password reset
  async verifyForgotPasswordOTP(
    email: string,
    otp: string,
    req: Request,
    res: Response
  ): Promise<{ user: IUser; token: string }> {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError("Email not registered", 404);
    }

    const storedHashedOTP = req.cookies.resetOTP;
    if (!storedHashedOTP) {
      throw new AppError("No OTP found", 400);
    }

    const isMatch = await bcrypt.compare(otp, storedHashedOTP);
    if (!isMatch) {
      throw new AppError("Invalid OTP", 400);
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
      user,
      token,
    };
  }
}
