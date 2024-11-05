import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

interface CustomRequest extends Request {
  user?: any;
}

const checkBlockedUser = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    console.log("middleware user:", user);

    if (user.status === "blocked") {
      console.log("User is blocked, sending 403");
      res.clearCookie("user");
      return next(new AppError("Your account has been blocked", 403));
    }
    next();
  } catch (error) {
    console.error("Error fetching users:", error);
    next(new AppError("Unknown error occurred", 500));
  }
};

export { checkBlockedUser };
