import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/adminServices';
import { AppError } from '../utils/AppError';

export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  async signIn(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { email, password } = req.body;

    try {
      const { admin, token } = await this.adminService.signIn(
        email,
        password,
        res
      );

      res.status(200).json({
        message: 'Admin sign in successful',
        admin: {
          id: admin._id,
          email: admin.email,
          role: admin.role,
        },
        token,
      });
    } catch (error) {
      console.error(error);
      next(new AppError('Admin authentication failed', 401));
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.adminService.logout(res);
      res.status(200).json({ message: 'Admin logout successful' });
    } catch (error) {
      console.error(error);
      next(new AppError('Admin logout failed', 500));
    }
  }

  async toggleStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const userId = req.query.id as string | undefined;

    if (!userId) {
      return next(new AppError('Invalid user ID', 400));
    }

    try {
      const updatedUser = await this.adminService.toggleUserStatus(userId);
      res.status(200).json({
        message: `User status changed to ${updatedUser.status}`,
        user: updatedUser,
      });
    } catch (error) {
      console.error(error);
      next(new AppError('Toggle status failed', 500));
    }
  }

  async getAllUsers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const users = await this.adminService.getAllUsers();
      res.status(200).json({
        message: 'Users fetched successfully',
        users,
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      next(new AppError('Failed to fetch users', 500));
    }
  }

  async getAllCategories(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const categories = await this.adminService.getAllCategories();
      res.status(200).json({
        message: 'Categories fetched successfully',
        categories,
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      next(new AppError('Failed to fetch users', 500));
    }
  }

  async toggleCategoryStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const CategoryId = req.query.categoryId as string | undefined;

    if (!CategoryId) {
      return next(new AppError('Invalid category ID', 400));
    }

    try {
      const updatedcategory =
        await this.adminService.toggleCategoryStatus(CategoryId);
      res.status(200).json({
        message: `category status changed to ${updatedcategory.status}`,
        category: updatedcategory,
      });
    } catch (error) {
      console.error(error);
      next(new AppError('Toggle status failed', 500));
    }
  }

  async createCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const categoryData = req.body;

      const newCategory = await this.adminService.createCategory(categoryData);

      res.status(201).json({
        status: 'success',
        message: 'Category created successfully',
        category: newCategory,
      });
    } catch (error) {
      console.error('Error creating category:', error);
      if (error instanceof AppError) {
        next(error);
      } else {
        next(new AppError('Failed to create category', 500));
      }
    }
  }
}
