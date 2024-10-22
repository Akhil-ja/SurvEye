import bcrypt from "bcrypt";
import User from "../models/usersModel";
import { IUser } from "../models/usersModel";
import { generateToken } from "../utils/jwtUtils";
import { generateOTP, sendOTP } from "../utils/otpUtils";
import PendingUser from "../models/pendingUserModel";
import { Request, Response } from "express";
import { AppError } from "../utils/AppError";

export class CreatorService {
  async initiateSignUp(creatorData: {
    email: string;
    phoneNumber: string;
    password: string;
    creatorName: string;
    industry: string;
  }): Promise<{ message: string; pendingUserId: string }> {
    const { email, phoneNumber, password, creatorName, industry } = creatorData;

    const existingCreatorByEmail = await User.findOne({ email });
    if (existingCreatorByEmail) {
      throw new AppError("Creator already exists with this email.", 400);
    }

    const existingCreatorByPhone = await User.findOne({ phoneNumber });
    if (existingCreatorByPhone) {
      throw new AppError("Creator already exists with this phone number.", 400);
    }

    const existingPendingCreatorByEmail = await PendingUser.find({ email });
    if (existingPendingCreatorByEmail.length > 0) {
      await PendingUser.deleteMany({ email });
      console.log(`Deleted duplicate pending signups for ${email}`);
    }

    const existingPendingCreatorByPhone = await PendingUser.find({
      phoneNumber,
    });
    if (existingPendingCreatorByPhone.length > 0) {
      await PendingUser.deleteMany({ phoneNumber });
      console.log(`Deleted duplicate pending signups for ${phoneNumber}`);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const pendingCreator = new PendingUser({
      email,
      phoneNumber,
      password: hashedPassword,
      role: "creator",
      creatorName,
      industry,
      otp,
      otpExpires,
    });

    await pendingCreator.save();
    await sendOTP(email, otp);
    console.log(`The OTP for ${email} is ${otp}`);

    return {
      message: "OTP sent for verification",
      pendingUserId: pendingCreator.id,
    };
  }

  // Verify OTP and Create Creator
  async verifyOTPAndCreateCreator(
    pendingUserId: string,
    otp: string,
    res: Response
  ): Promise<IUser> {
    const pendingCreator = await PendingUser.findById(pendingUserId);
    if (!pendingCreator) {
      throw new AppError("Invalid or expired signup request", 400);
    }

    if (pendingCreator.otp !== otp) {
      throw new AppError("Invalid OTP", 400);
    }

    if (pendingCreator.otpExpires < new Date()) {
      throw new AppError("OTP has expired", 400);
    }

    const phoneNumber = pendingCreator.phoneNumber || undefined;

    const newCreator = new User({
      email: pendingCreator.email,
      phoneNumber: phoneNumber,
      password: pendingCreator.password,
      role: "creator",
      creator_name: pendingCreator.creatorName,
      industry: pendingCreator.industry,
      created_at: new Date(),
      wallets: [],
      days_active: 0,
    });

    await newCreator.save();
    await PendingUser.deleteOne({ _id: pendingUserId });

    const token = generateToken(newCreator.id, newCreator.role);

    res.cookie("user", token, {
      httpOnly: true,
      secure: false,
      maxAge: 3 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
    });

    return newCreator;
  }

  // Sign In
  async signIn(
    email: string,
    password: string,
    res: Response,
    req: Request
  ): Promise<{ user: IUser; token: string }> {
    const user = await User.findOne({ email });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.role !== "creator") {
      throw new AppError("User is not authorized as a creator", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError("Incorrect password", 401);
    }

    const token = generateToken(user.id, user.role);

    res.cookie("user", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
    });

    console.log("Cookie set. Response headers:", res.getHeaders());
    console.log("All cookies after signIn:", req.cookies);

    return { user, token };
  }

  // Send OTP for Forgot Password
  async sendOTPForForgotPassword(email: string, res: Response): Promise<void> {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError("Email not registered", 404);
    }

    if (user.role !== "creator") {
      throw new AppError("User is not authorized as a creator", 401);
    }

    if (user.status === "blocked") {
      throw new AppError("User is blocked or inactive", 403);
    }

    const otp = generateOTP();
    console.log(`The Forgot OTP for ${email} is ${otp}`);

    res.cookie("resetOTP", otp, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 10 * 60 * 1000,
      sameSite: "strict",
    });

    console.log("Cookie set for OTP reset:", res.getHeaders());

    await sendOTP(user.email, otp);
  }

  // Verify OTP and Sign In
  async verifyOTPAndSignIn(
    email: string,
    otp: string,
    res: Response,
    req: Request
  ): Promise<{ user: IUser; token: string }> {
    const user = await User.findOne({ email });

    if (!user) {
      throw new AppError("Email not registered", 404);
    }

    if (user.role !== "creator") {
      throw new AppError("User is not authorized as a creator", 401);
    }

    console.log("All cookies:", req.cookies);
    console.log("resetOTP cookie:", req.cookies.resetOTP);

    const storedOTP = req.cookies.resetOTP;

    if (!storedOTP) {
      throw new AppError("No OTP found", 400);
    }

    if (otp !== storedOTP) {
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

    return { user, token };
  }
}

export const creatorService = new CreatorService();
