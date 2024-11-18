import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import { ICategory, IUser } from '../interfaces/common.interface';
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

  async getAllCategories(active: boolean): Promise<ICategory[]> {
    return this.adminRepository.getAllCategories(active);
  }

  async toggleCategoryStatus(CategoryId: string): Promise<ICategory> {
    const category = await this.adminRepository.findCategoryById(CategoryId);

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    category.status = category.status === true ? false : true;
    return this.adminRepository.saveCategory(category);
  }

  async createCategory(categoryData: Partial<ICategory>): Promise<ICategory> {
    try {
      if (!categoryData.name || !categoryData.description) {
        throw new AppError('Name and description are required', 400);
      }

      const newCategoryData = {
        ...categoryData,
        status: categoryData.status ?? true,
      };

      const category =
        await this.adminRepository.createCategory(newCategoryData);
      return category;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to create category', 500);
    }
  }
  async updateCategory(
    categoryId: string,
    categoryData: Partial<ICategory>
  ): Promise<ICategory> {
    try {
      const existingCategory =
        await this.adminRepository.findCategoryById(categoryId);
      if (!existingCategory) {
        throw new AppError('Category not found', 404);
      }

      if (categoryData.name !== undefined && !categoryData.name.trim()) {
        throw new AppError('Category name cannot be empty', 400);
      }

      if (
        categoryData.description !== undefined &&
        !categoryData.description.trim()
      ) {
        throw new AppError('Category description cannot be empty', 400);
      }

      const updatedCategory = await this.adminRepository.updateCategory(
        categoryId,
        categoryData
      );

      return updatedCategory;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update category', 500);
    }
  }
}
