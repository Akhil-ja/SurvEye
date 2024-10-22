import { Response } from "express";
import jwt from "jsonwebtoken";
import Admin, { IAdmin } from "../models/adminModel";
import User, { IUser } from "../models/usersModel";
import { AppError } from "../utils/AppError";

export const adminService = {
  async signIn(email: string, password: string, res: Response) {
    const admin = await Admin.findOne({ email });

    if (!admin) {
      throw new AppError("Admin not found", 404);
    }

    const isPasswordValid = password === admin.password;

    if (!isPasswordValid) {
      throw new AppError("Invalid password", 401);
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    res.cookie("Admin_jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000,
      sameSite: "strict",
    });

    const { password: _, ...adminInfo } = admin.toObject();

    return { admin: adminInfo, token };
  },

  async logout(res: Response) {
    await res.clearCookie("Admin_jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
  },

  async toggleUserStatus(userId: string): Promise<IUser> {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    user.status = user.status === "active" ? "blocked" : "active";
    await user.save();

    return user;
  },

  async getAllUsers(): Promise<IUser[]> {
    const users = await User.find();
    if (!users || users.length === 0) {
      throw new AppError("No users found", 404);
    }
    return users;
  },
};
