import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const verifyAdminToken = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies?.Admin_jwt;

    if (!token) {
      res.status(401).json({ message: 'No token, authorization denied' });
      return;
    }

    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET || 'defaultSecret'
    );

    if (decoded.role !== 'admin') {
      res.status(403).json({ message: 'Access denied: not an admin' });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export default verifyAdminToken;
