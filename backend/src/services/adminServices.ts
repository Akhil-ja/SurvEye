import { Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Admin, { IAdmin } from "../models/adminModel";

export const adminService = {
  async signIn(email: string, password: string, res: Response) {
    const admin = await Admin.findOne({ email });

    if (!admin) {
      throw new Error("Admin not found");
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      throw new Error("Invalid password");
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
    res.clearCookie("Admin_jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
  },
};
