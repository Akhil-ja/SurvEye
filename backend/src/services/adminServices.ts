import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import {
  ICategory,
  IUser,
  IOccupation,
  ITransaction,
  IAdminCut,
  IAnnouncement,
  ISurvey,
  CreateAnnouncementParams,
} from '../interfaces/common.interface';
import socketConfig from '../socketConfig';
import { IAdminService } from '../interfaces/IServiceInterface/IAdminServices';
import { IAdminRepository } from '../interfaces/IRepositoryInterface/IAdminRepository';
import { ISurveyRepository } from '../interfaces/IRepositoryInterface/ISurveyRepository';
import { IAnnouncementRepository } from '../interfaces/IRepositoryInterface/IAnnouncementRepository';
import { ITransactionRepository } from '../interfaces/IRepositoryInterface/ITransactionRepository';
import { ICategoryRepository } from '../interfaces/IRepositoryInterface/ICategoryRepository';

export class AdminService implements IAdminService {
  constructor(
    private readonly adminRepository: IAdminRepository,
    private readonly surveyRepository: ISurveyRepository,
    private readonly announcementRepository: IAnnouncementRepository,
    private readonly transactionRepository: ITransactionRepository,
    private readonly categoryRepository: ICategoryRepository
  ) {}

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
      { id: admin._id, email: admin.email, role: 'admin' },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    res.cookie('Admin_jwt', token, {
      httpOnly: true,
      secure: true,
      maxAge: 3600000,
      sameSite: 'none',
    });

    const { password: _, ...adminInfo } = admin.toObject();

    return { admin: adminInfo, token };
  }

  async logout(res: Response): Promise<void> {
    res.clearCookie('Admin_jwt', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
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
    return this.categoryRepository.getAllCategories(active);
  }

  async toggleCategoryStatus(CategoryId: string): Promise<ICategory> {
    const category = await this.categoryRepository.findCategoryById(CategoryId);

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    category.status = category.status === true ? false : true;
    return this.categoryRepository.saveCategory(category);
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
        await this.categoryRepository.createCategory(newCategoryData);
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
        await this.categoryRepository.findCategoryById(categoryId);
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

      const updatedCategory = await this.categoryRepository.updateCategory(
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

  async getAllOccupations(active: boolean): Promise<IOccupation[]> {
    return this.adminRepository.getAllOccupations(active);
  }

  async toggleOccupationStatus(occupationId: string): Promise<IOccupation> {
    const occupation =
      await this.adminRepository.findOccupationById(occupationId);

    if (!occupation) {
      throw new AppError('Occupation not found', 404);
    }

    occupation.status = occupation.status === true ? false : true;
    return this.adminRepository.saveOccupation(occupation);
  }

  async createOccupation(
    occupationData: Partial<IOccupation>
  ): Promise<IOccupation> {
    try {
      if (!occupationData.name || !occupationData.description) {
        throw new AppError('Name and description are required', 400);
      }

      const newOccupationData = {
        ...occupationData,
        status: occupationData.status ?? true,
      };

      const occupation =
        await this.adminRepository.createOccupation(newOccupationData);
      return occupation;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to create occupation', 500);
    }
  }

  async updateOccupation(
    occupationId: string,
    occupationData: Partial<IOccupation>
  ): Promise<IOccupation> {
    try {
      const existingOccupation =
        await this.adminRepository.findOccupationById(occupationId);
      if (!existingOccupation) {
        throw new AppError('Occupation not found', 404);
      }

      if (occupationData.name !== undefined && !occupationData.name.trim()) {
        throw new AppError('Occupation name cannot be empty', 400);
      }

      if (
        occupationData.description !== undefined &&
        !occupationData.description.trim()
      ) {
        throw new AppError('Occupation description cannot be empty', 400);
      }

      const updatedOccupation = await this.adminRepository.updateOccupation(
        occupationId,
        occupationData
      );

      return updatedOccupation;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update occupation', 500);
    }
  }
  async getAllTransactions(): Promise<ITransaction[]> {
    return this.transactionRepository.getAllTransactions();
  }
  async getAllData(): Promise<any> {
    return this.adminRepository.getAllData();
  }

  async createAdminCut(percentage: number): Promise<IAdminCut> {
    try {
      return this.adminRepository.createAdminCut(percentage);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to create category', 500);
    }
  }

  async editAdminCut(percentage: number): Promise<IAdminCut> {
    try {
      return this.adminRepository.editAdminCut(percentage);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to create category', 500);
    }
  }

  async createAnnouncement(
    params: CreateAnnouncementParams
  ): Promise<IAnnouncement> {
    try {
      const announcement = await this.announcementRepository.createAnnouncement(
        {
          ...params,
          timestamp: new Date(),
          type: 'admin',
        }
      );

      try {
        const { title, message, target } = params;
        socketConfig.sendAnnouncement({ title, message, target });
        console.log('Announcement broadcasted successfully');
      } catch (wsError) {
        console.error('WebSocket broadcast failed:', wsError);
      }

      return announcement;
    } catch (error) {
      console.error('Service Error:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to create Announcement', 500);
    }
  }

  async getAllAnnouncement(): Promise<IAnnouncement[]> {
    return this.announcementRepository.getAllAnnouncement();
  }

  async getAllSurveys(): Promise<ISurvey[]> {
    return this.surveyRepository.getAllSurveys();
  }

  async toggleSurveyStatus(SurveyId: string): Promise<ISurvey> {
    const survey = await this.surveyRepository.findSurveyById(SurveyId);

    if (!survey) {
      throw new AppError('Survey not found', 404);
    }

    survey.status = survey.status === 'active' ? 'cancelled' : 'active';

    return this.surveyRepository.saveSurvey(survey);
  }
}
