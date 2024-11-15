import Admin from '../models/adminModel';
import User from '../models/usersModel';
import { IAdmin, ICategory, IUser } from '../interfaces/common.interface';
import { Types } from 'mongoose';
import { AppError } from '../utils/AppError';
import Category from '../models/categoryModel';

export class AdminRepository {
  async findByEmail(email: string): Promise<IAdmin | null> {
    return Admin.findOne({ email });
  }

  async findById(id: Types.ObjectId): Promise<IAdmin | null> {
    return Admin.findById(id);
  }

  async findUserById(userId: string): Promise<IUser | null> {
    return User.findById(userId);
  }

  async getAllUsers(): Promise<IUser[]> {
    const users = await User.find();
    if (!users || users.length === 0) {
      throw new AppError('No users found', 404);
    }
    return users;
  }

  async saveUser(user: IUser): Promise<IUser> {
    return user.save();
  }

  async getAllCategories(): Promise<ICategory[]> {
    const categories = await Category.find();
    if (!categories || categories.length === 0) {
      throw new AppError('No categories found', 404);
    }
    return categories;
  }
}
