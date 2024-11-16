import { IAdmin, IUser, ICategory } from '../interfaces/common.interface';
import { Types } from 'mongoose';

export interface IAdminRepository {
  findByEmail(email: string): Promise<IAdmin | null>;
  findById(id: Types.ObjectId): Promise<IAdmin | null>;
  findUserById(userId: string): Promise<IUser | null>;
  getAllUsers(): Promise<IUser[]>;
  saveUser(user: IUser): Promise<IUser>;
  //category
  getAllCategories(): Promise<ICategory[]>;
  createCategory(categoryData: Partial<ICategory>): Promise<ICategory>;
  findCategoryById(categoryId: string): Promise<ICategory | null>;
  saveCategory(category: ICategory): Promise<ICategory>;
}
