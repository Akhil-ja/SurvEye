import bcrypt from "bcrypt";
import User from "../models/usersModel";
import { IUser } from "../models/usersModel";
import { generateToken } from "../utils/jwtUtils";
import { generateOTP, sendOTP } from "../utils/otpUtils";
import PendingUser from "../models/pendingUserModel";
import { Request, Response } from "express";

export class CreatorService {
  async initiateSignUp(creatorData: {
    email: string;
    phoneNumber: string;
    password: string;
    creatorName: string;
    industry: string;
  }): Promise<{ message: string; pendingUserId: string }> {
    const { email, phoneNumber, password, creatorName, industry } = creatorData;

    const existingCreator = await User.findOne({ email });

    if (existingCreator) {
      throw new Error("Creator already exists with this email.");
    }

    const existingPendingCreator = await PendingUser.find({ email });

    if (existingPendingCreator.length > 0) {
      await PendingUser.deleteMany({ email });
      console.log(`Deleted duplicate pending signups for ${email}`);
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

  async verifyOTPAndCreateCreator(
    pendingUserId: string,
    otp: string,
    res: Response
  ): Promise<IUser> {
    const pendingCreator = await PendingUser.findById(pendingUserId);
    if (!pendingCreator) {
      throw new Error("Invalid or expired signup request");
    }

    if (pendingCreator.otp !== otp) {
      throw new Error("Invalid OTP");
    }

    if (pendingCreator.otpExpires < new Date()) {
      throw new Error("OTP has expired");
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

  async signIn(
    email: string,
    password: string,
    res: Response,
    req: Request
  ): Promise<{ user: IUser; token: string }> {
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("Email not registered");
    }

    if (user.role !== "creator") {
      throw new Error("User is not authorized as a creator");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Incorrect password");
    }

    const token = generateToken(user.id, user.role);

    res.cookie("user", token, {
      httpOnly: true,
      secure: false,
      maxAge: 3 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
    });

    console.log("Cookie set. Response headers:", res.getHeaders());
    console.log("All cookies after signIn:", req.cookies);

    return { user, token };
  }

  async sendOTPForForgotPassword(email: string, res: Response): Promise<void> {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Email not registered");
    }

    if (user.role !== "user") {
      throw new Error("Creator is not authorized as a user");
    }

    if (user.status === "blocked") {
      throw new Error("User is blocked or inactive");
    }

    const otp = generateOTP();
    console.log(`the Forgot OTP is ${otp}`);

    res.cookie("resetOTP", otp, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Changed this line
      maxAge: 10 * 60 * 1000, // 10 minutes
      sameSite: "strict",
    });

    console.log("Cookie set:", {
      name: "resetOTP",
      value: otp,
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 10 * 60 * 1000,
        sameSite: "strict",
      },
    });

    console.log("Response headers:", res.getHeaders());

    await sendOTP(user.email, otp);
  }

  async verifyOTPAndSignIn(
    email: string,
    otp: string,
    res: Response,
    req: Request
  ): Promise<{ user: IUser; token: string }> {
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("Email not registered");
    }

    if (user.role !== "creator") {
      throw new Error("User is not authorized as a creator");
    }

    console.log("All cookies:", req.cookies);
    console.log("resetOTP cookie:", req.cookies.resetOTP);

    const storedOTP = req.cookies.resetOTP;

    if (!storedOTP) {
      console.log("OTP not found in cookies");
      throw new Error("No OTP found");
    }

    if (otp !== storedOTP) {
      console.log("OTP mismatch. Provided:", otp, "Stored:", storedOTP);
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
    return { user, token };
  }
}

export const creatorService = new CreatorService();
