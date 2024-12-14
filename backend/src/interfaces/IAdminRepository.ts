import {
  IAdmin,
  IUser,
  ICategory,
  IOccupation,
  ITransaction,
  IAdminCut,
} from '../interfaces/common.interface';
import { Types } from 'mongoose';

export interface IAdminRepository {
  findByEmail(email: string): Promise<IAdmin | null>;
  findById(id: Types.ObjectId): Promise<IAdmin | null>;
  findUserById(userId: string): Promise<IUser | null>;
  getAllUsers(): Promise<IUser[]>;
  saveUser(user: IUser): Promise<IUser>;
  //category
  getAllCategories(acive: boolean): Promise<ICategory[]>;
  createCategory(categoryData: Partial<ICategory>): Promise<ICategory>;
  findCategoryById(categoryId: string): Promise<ICategory | null>;
  saveCategory(category: ICategory): Promise<ICategory>;
  updateCategory(
    categoryId: string,
    categoryData: Partial<ICategory>
  ): Promise<ICategory>;

  //Occupation
  getAllOccupation(acive: boolean): Promise<IOccupation[]>;
  createOccupation(OccupationData: Partial<IOccupation>): Promise<IOccupation>;
  findOccupationById(occupationId: string): Promise<IOccupation | null>;
  saveOccupation(occupation: IOccupation): Promise<IOccupation>;
  updateOccupation(
    occupationId: string,
    OccupationData: Partial<IOccupation>
  ): Promise<IOccupation>;
  //transaction
  getAllTransactions(): Promise<ITransaction[]>;
  getAllData(): Promise<any>;
  createAdminCut(percentage: number): Promise<IAdminCut>;
  editAdminCut(percentage: number): Promise<IAdminCut>;
}
