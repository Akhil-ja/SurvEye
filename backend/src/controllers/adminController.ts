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
        id: admin._id,
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

export const toggleStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.query.id as string | undefined;

  if (!userId) {
    res.status(400).json({ message: "Invalid user ID" });
    return;
  }

  try {
    const updatedUser = await adminService.toggleUserStatus(userId);
    res.status(200).json({
      message: `User status changed to ${updatedUser.status}`,
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Toggle Status failed",
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
};
