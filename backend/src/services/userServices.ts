import bcrypt from "bcrypt";
import User from "../models/usersModel";
import { IUser } from "../models/usersModel";
import { generateToken } from "../utils/jwtUtils";
import PendingUser from "../models/pendingUserModel";
import { generateOTP, sendOTP } from "../utils/otputils";

export class UserService {
  async initiateSignUp(userData: {
    email: string;
    phoneNumber: string;
    password: string;
    role: "user" | "creator";
    firstName?: string;
    lastName?: string;
    creatorName?: string;
    industry?: string;
    dateOfBirth?: string;
  }): Promise<{ message: string; pendingUserId: string }> {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const otp = generateOTP();
    console.log(`otp is ${otp}`);

    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

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

    // Send OTP to user's email or phone
    await sendOTP(userData.email, otp); // Implement this function

    return {
      message: "OTP sent for verification",
      pendingUserId: pendingUser.id,
    };
  }

  async signIn(
    email: string,
    password: string
  ): Promise<{ user: IUser; token: string }> {
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("Email not registered");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Incorrect password");
    }

    if (user.role !== "user") {
      throw new Error("Access denied. Invalid role");
    }

    const token = generateToken(user.id, user.role);

    return { user, token };
  }

  async verifyOTPAndCreateUser(
    pendingUserId: string,
    otp: string
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

    const newUser = new User({
      email: pendingUser.email,
      phoneNumber: pendingUser.phoneNumber,
      password: pendingUser.password,
      role: pendingUser.role,
      first_name: pendingUser.firstName,
      last_name: pendingUser.lastName,
      creator_name: pendingUser.creatorName,
      industry: pendingUser.industry,
      date_of_birth: pendingUser.dateOfBirth,
      created_at: new Date(),
      wallets: [],
      days_active: 0,
    });

    await newUser.save();

    await PendingUser.deleteOne({ _id: pendingUserId });

    return newUser;
  }
}

export const userService = new UserService();
