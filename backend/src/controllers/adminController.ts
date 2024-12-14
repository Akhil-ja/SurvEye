import { Request, Response, NextFunction, request, response } from 'express';
import { AdminService } from '../services/adminServices';
import { AppError } from '../utils/AppError';
import { IAdminCut } from '../interfaces/common.interface';

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
      const { isActive } = req.params;
      const active = isActive === 'true';

      const categories = await this.adminService.getAllCategories(active);
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

  async updateCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const categoryId = req.query.categoryid as string;
      const updateData = req.body;

      console.log('updated data', updateData);
      console.log('category id', categoryId);

      if (!categoryId) {
        throw new AppError('Category ID is required', 400);
      }

      const updatedCategory = await this.adminService.updateCategory(
        categoryId,
        updateData
      );

      res.status(200).json({
        status: 'success',
        message: 'Category updated successfully',
        category: updatedCategory,
      });
    } catch (error) {
      console.error('Error updating category:', error);
      if (error instanceof AppError) {
        next(error);
      } else {
        next(new AppError('Failed to update category', 500));
      }
    }
  }

  async getAllOccupations(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { isActive } = req.params;
      const active = isActive === 'true';
      console.log(isActive, active);

      const occupations = await this.adminService.getAllOccupations(active);
      res.status(200).json({
        message: 'Occupations fetched successfully',
        occupations,
      });
    } catch (error) {
      console.error('Error fetching occupations:', error);
      next(new AppError('Failed to fetch occupations', 500));
    }
  }

  async toggleOccupationStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const occupationId = req.query.occupationId as string | undefined;

    if (!occupationId) {
      return next(new AppError('Invalid occupation ID', 400));
    }

    try {
      const updatedOccupation =
        await this.adminService.toggleOccupationStatus(occupationId);
      res.status(200).json({
        message: `Occupation status changed to ${updatedOccupation.status}`,
        occupation: updatedOccupation,
      });
    } catch (error) {
      console.error(error);
      next(new AppError('Toggle status failed', 500));
    }
  }

  async createOccupation(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const occupationData = req.body;
      console.log(occupationData);

      const newOccupation =
        await this.adminService.createOccupation(occupationData);

      res.status(201).json({
        status: 'success',
        message: 'Occupation created successfully',
        occupation: newOccupation,
      });
    } catch (error) {
      console.error('Error creating occupation:', error);
      if (error instanceof AppError) {
        next(error);
      } else {
        next(new AppError('Failed to create occupation', 500));
      }
    }
  }

  async updateOccupation(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const occupationId = req.query.occupationId as string;
      const updateData = req.body;

      if (!occupationId) {
        throw new AppError('Occupation ID is required', 400);
      }

      const updatedOccupation = await this.adminService.updateOccupation(
        occupationId,
        updateData
      );

      res.status(200).json({
        status: 'success',
        message: 'Occupation updated successfully',
        occupation: updatedOccupation,
      });
    } catch (error) {
      console.error('Error updating occupation:', error);
      if (error instanceof AppError) {
        next(error);
      } else {
        next(new AppError('Failed to update occupation', 500));
      }
    }
  }

  async getTransactions(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const transactions = await this.adminService.getAllTransactions();

      res.status(200).json({
        message: 'transactions fetched successfully',
        transactions,
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      next(new AppError('Failed to fetch transactions', 500));
    }
  }

  async getData(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = await this.adminService.getAllData();

      res.status(200).json({
        message: 'data fetched successfully',
        data,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      next(new AppError('Failed to fetch data', 500));
    }
  }

  async createAdminCut(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { percentage } = req.body;
      const adminCutData = await this.adminService.editAdminCut(percentage);
      res.status(200).json({
        message: 'admin Cut Data fetched successfully',
        adminCutData,
      });
    } catch (error) {
      console.error('Error fetching Admin cut:', error);
      next(new AppError('Failed to fetch Admin cut', 500));
    }
  }

  async editAdminCut(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { percentage } = req.body;
      const adminCutData = await this.adminService.editAdminCut(percentage);
      res.status(200).json({
        message: 'admin Cut Data edited successfully',
        adminCutData,
      });
    } catch (error) {
      console.error('Error editing Admin cut:', error);
      next(new AppError('Failed to  Admin cut', 500));
    }
  }
}
