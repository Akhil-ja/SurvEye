import Admin from '../models/adminModel';
import User from '../models/usersModel';
import {
  IAdmin,
  ICategory,
  IUser,
  IOccupation,
} from '../interfaces/common.interface';
import { Types } from 'mongoose';
import { AppError } from '../utils/AppError';
import Category from '../models/categoryModel';
import Occupation from '../models/occupationModel';

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

  async getAllCategories(active: boolean): Promise<ICategory[]> {
    let categories: ICategory[];

    if (active) {
      categories = await Category.find({ status: active });
    } else {
      categories = await Category.find({});
    }

    if (!categories || categories.length === 0) {
      throw new AppError('No categories found', 404);
    }

    return categories;
  }

  async saveCategory(category: ICategory): Promise<ICategory> {
    return category.save();
  }

  async findCategoryById(CategoryId: string): Promise<ICategory | null> {
    return Category.findById(CategoryId);
  }
  async createCategory(categoryData: Partial<ICategory>): Promise<ICategory> {
    try {
      const newCategory = new Category(categoryData);
      const savedCategory = await newCategory.save();
      if (!savedCategory) {
        throw new AppError('Failed to create category', 400);
      }
      return savedCategory;
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(error.message, 400);
      }
      throw new AppError('Failed to create category', 400);
    }
  }

  async updateCategory(
    categoryId: string,
    categoryData: Partial<ICategory>
  ): Promise<ICategory> {
    try {
      const category = await Category.findById(categoryId);

      if (!category) {
        throw new AppError('Category not found', 404);
      }

      Object.assign(category, categoryData);

      const updatedCategory = await category.save();

      if (!updatedCategory) {
        throw new AppError('Failed to update category', 400);
      }

      return updatedCategory;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update category', 500);
    }
  }

  async getAllOccupations(active: boolean): Promise<IOccupation[]> {
    let occupations: IOccupation[];

    if (active) {
      occupations = await Occupation.find({ status: active });
    } else {
      occupations = await Occupation.find({});
    }

    if (!occupations || occupations.length === 0) {
      throw new AppError('No occupations found', 404);
    }

    return occupations;
  }

  async findOccupationById(occupationId: string): Promise<IOccupation | null> {
    return Occupation.findById(occupationId);
  }

  async saveOccupation(occupation: IOccupation): Promise<IOccupation> {
    return occupation.save();
  }

  async createOccupation(
    occupationData: Partial<IOccupation>
  ): Promise<IOccupation> {
    try {
      const newOccupation = new Occupation(occupationData);
      const savedOccupation = await newOccupation.save();
      if (!savedOccupation) {
        throw new AppError('Failed to create occupation', 400);
      }
      return savedOccupation;
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(error.message, 400);
      }
      throw new AppError('Failed to create occupation', 400);
    }
  }

  async updateOccupation(
    occupationId: string,
    occupationData: Partial<IOccupation>
  ): Promise<IOccupation> {
    try {
      const occupation = await Occupation.findById(occupationId);

      if (!occupation) {
        throw new AppError('Occupation not found', 404);
      }

      Object.assign(occupation, occupationData);

      const updatedOccupation = await occupation.save();

      if (!updatedOccupation) {
        throw new AppError('Failed to update occupation', 400);
      }

      return updatedOccupation;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update occupation', 500);
    }
  }
}
