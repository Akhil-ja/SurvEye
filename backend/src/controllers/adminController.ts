import { Request, Response } from "express";
import { adminService } from "../services/adminServices";

export const adminSignIn = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, password } = req.body;

  try {
    const { admin, token } = await adminService.signIn(email, password, res);

    res.status(200).json({
      message: "Admin sign in successful",
      admin: {
        id: admin._id, // Changed from admin.id to admin._id
        email: admin.email,
        role: admin.role,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({
      message: "Admin authentication failed",
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
};

export const adminLogout = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    await adminService.logout(res);
    res.status(200).json({ message: "Admin logout successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Admin logout failed",
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
};
