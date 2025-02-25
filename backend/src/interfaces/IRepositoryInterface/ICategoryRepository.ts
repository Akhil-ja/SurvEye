import { ICategory } from '../common.interface';

export interface ICategoryRepository {
  getAllCategories(active: boolean): Promise<ICategory[]>;
  saveCategory(category: ICategory): Promise<ICategory>;
  findCategoryById(categoryId: string): Promise<ICategory | null>;
  createCategory(categoryData: Partial<ICategory>): Promise<ICategory>;
  updateCategory(
    categoryId: string,
    categoryData: Partial<ICategory>
  ): Promise<ICategory>;
  countCategoriesByIds(categoryIds: string[]): Promise<number>;
  getCategoriesByStatus(active: boolean): Promise<ICategory[]>;
  getAllCategoriesUnfiltered(): Promise<ICategory[]>;
}
