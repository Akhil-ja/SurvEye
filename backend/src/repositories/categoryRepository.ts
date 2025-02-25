import { AppError } from '../utils/AppError';
import { ICategory } from '../interfaces/common.interface';
import Category from '../models/categoryModel';
import { ICategoryRepository } from '../interfaces/IRepositoryInterface/ICategoryRepository';

export class CategoryRepository implements ICategoryRepository {
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

  async findCategoryById(categoryId: string): Promise<ICategory | null> {
    return Category.findById(categoryId);
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

  async countCategoriesByIds(categoryIds: string[]): Promise<number> {
    return await Category.countDocuments({ _id: { $in: categoryIds } });
  }

  async getCategoriesByStatus(active: boolean): Promise<ICategory[]> {
    return await Category.find({ status: active });
  }

  async getAllCategoriesUnfiltered(): Promise<ICategory[]> {
    return await Category.find({});
  }
}
