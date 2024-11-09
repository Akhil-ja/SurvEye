import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import { IUser } from '../interfaces/common.interface';
import { AdminRepository } from '../repositories/adminRepository';

export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) {}

  async signIn(email: string, password: string, res: Response) {
    const admin = await this.adminRepository.findByEmail(email);

    if (!admin) {
      throw new AppError('Admin not found', 404);
    }

    const isPasswordValid = password === admin.password;

    if (!isPasswordValid) {
      throw new AppError('Invalid password', 401);
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    res.cookie('Admin_jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000,
      sameSite: 'strict',
    });

    const { password: _, ...adminInfo } = admin.toObject();

    return { admin: adminInfo, token };
  }

  async logout(res: Response): Promise<void> {
    res.clearCookie('Admin_jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
  }

  async toggleUserStatus(userId: string): Promise<IUser> {
    const user = await this.adminRepository.findUserById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.status = user.status === 'active' ? 'blocked' : 'active';
    return this.adminRepository.saveUser(user);
  }

  async getAllUsers(): Promise<IUser[]> {
    return this.adminRepository.getAllUsers();
  }
}
