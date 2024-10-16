import bcrypt from "bcrypt";
import User from "../models/usersModel";
import { IUser } from "../models/usersModel";
import { generateToken } from "../utils/jwtUtils";
import PendingUser from "../models/pendingUserModel";
import { generateOTP, sendOTP } from "../utils/otpUtils";
import { Request, Response } from "express";

export class UserService {
  async initiateSignUp(userData: {
    email: string;
    phoneNumber: string;
    password: string;
    role: "user";
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
  }): Promise<{ message: string; pendingUserId: string }> {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error("User already exists");
    }

    const existingPendingUser = await PendingUser.find({
      email: userData.email,
    });
    if (existingPendingUser.length > 0) {
      await PendingUser.deleteMany({ email: userData.email });
      console.log(`Deleted duplicate pending signups for ${userData.email}`);
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const pendingUser = new PendingUser({
      ...userData,
      password: hashedPassword,
      otp,
      otpExpires,
      dateOfBirth: userData.dateOfBirth
        ? new Date(userData.dateOfBirth)
        : undefined,
    });

    await pendingUser.save();
    await sendOTP(userData.email, otp);
    console.log(`The OTP for ${userData.email} is ${otp}`);

    return {
      message: "OTP sent for verification",
      pendingUserId: pendingUser.id,
    };
  }

  async verifyOTPAndCreateUser(
    pendingUserId: string,
    otp: string,
    res: Response
  ): Promise<IUser> {
    const pendingUser = await PendingUser.findById(pendingUserId);
    if (!pendingUser) {
      throw new Error("Invalid or expired signup request");
    }

    if (pendingUser.otp !== otp) {
      throw new Error("Invalid OTP");
    }

    if (pendingUser.otpExpires < new Date()) {
      throw new Error("OTP has expired");
    }

    const phoneNumber = pendingUser.phoneNumber || undefined;

    const newUser = new User({
      email: pendingUser.email,
      phoneNumber: phoneNumber,
      password: pendingUser.password,
      role: "user",
      first_name: pendingUser.firstName,
      last_name: pendingUser.lastName,
      date_of_birth: pendingUser.dateOfBirth,
      created_at: new Date(),
      wallets: [],
      days_active: 0,
    });

    await newUser.save();
    await PendingUser.deleteOne({ _id: pendingUserId });

    const token = generateToken(newUser.id, newUser.role);

    res.cookie("user", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
    });

    return newUser;
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

    if (user.role !== "user") {
      throw new Error("User is not authorized as a user");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Incorrect password");
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

  async sendOTPForForgotPassword(email: string, res: Response): Promise<void> {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Email not registered");
    }

    if (user.role !== "user") {
      throw new Error("User is not authorized as a user");
    }

    if (user.status === "blocked") {
      throw new Error("User is blocked or inactive");
    }

    const otp = generateOTP();
    console.log(`the Forgot OTP is ${otp}`);

    res.cookie("resetOTP", otp, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
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

    if (user.role !== "user") {
      throw new Error("User is not authorized as a user");
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

  async Logout(res: Response, req: Request): Promise<void> {
    console.log("All cookies before logout:", req.cookies);
    res.clearCookie("user", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    console.log("All cookies after logout:", req.cookies);
  }
}

export const userService = new UserService();
