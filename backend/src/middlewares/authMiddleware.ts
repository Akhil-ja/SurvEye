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
) => {
  const token = req.cookies?.user;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (err) {
      res.status(401).json({ message: "Invalid token" });
    }
  } else {
    res.status(401).json({ message: "Not Authorized, no token" });
  }
};

export { protect };
