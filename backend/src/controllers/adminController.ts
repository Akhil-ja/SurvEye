import { Request, Response, NextFunction } from "express";
import { adminService } from "../services/adminServices";
import { AppError } from "../utils/AppError";

export const adminSignIn = async (
  req: Request,
  res: Response,
  next: NextFunction
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
    next(new AppError("Admin authentication failed", 401));
  }
};

export const adminLogout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await adminService.logout(res);
    res.status(200).json({ message: "Admin logout successful" });
  } catch (error) {
    console.error(error);
    next(new AppError("Admin logout failed", 500));
  }
};

export const toggleStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.query.id as string | undefined;

  if (!userId) {
    return next(new AppError("Invalid user ID", 400));
  }

  try {
    const updatedUser = await adminService.toggleUserStatus(userId);
    res.status(200).json({
      message: `User status changed to ${updatedUser.status}`,
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    next(new AppError("Toggle status failed", 500));
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await adminService.getAllUsers();
    res.status(200).json({
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    next(new AppError("Failed to fetch users", 500)); // Pass the error to the global error handler
  }
};
