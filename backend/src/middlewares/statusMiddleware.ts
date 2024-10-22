import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import User from "../models/usersModel";

interface CustomRequest extends Request {
  user?: any;
}

const checkBlockedUser = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (user.status === "blocked") {
      return res.status(403).json({
        message: "Access denied. Your account has been blocked.",
      });
    }
    next();
  } catch (err) {
    console.error("Error in checkBlockedUser middleware:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { checkBlockedUser };
