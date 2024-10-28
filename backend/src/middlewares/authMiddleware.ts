import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User from "../models/usersModel";

interface CustomRequest extends Request {
  user?: any;
}

const protect = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log("in protect");

    const token = req.cookies?.user;

    if (!token) {
      res.status(401).json({ message: "Not authorized, no token" });
      return;
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }
    console.log(user);

    req.user = user;
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: "Invalid token....." });
    } else {
      res.status(500).json({ message: "Server error" });
    }
  }
};

export { protect };
