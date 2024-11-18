import { Response } from 'express';
import { IUser, IAdmin, ICategory } from '../interfaces/common.interface';

export interface IAdminService {
  signIn(
    email: string,
    password: string,
    res: Response
  ): Promise<{
    admin: Omit<IAdmin, 'password'>;
    token: string;
  }>;
  logout(res: Response): Promise<void>;
  toggleUserStatus(userId: string): Promise<IUser>;
  getAllUsers(): Promise<IUser[]>;
  //category
  getAllCategories(): Promise<ICategory[]>;
  createCategory(categoryData: Partial<ICategory>): Promise<ICategory>;
  updateCategory(
    categoryId: string,
    categoryData: Partial<ICategory>
  ): Promise<ICategory>;
  toggleCategoryStatus(categoryId: string): Promise<ICategory>;
}
