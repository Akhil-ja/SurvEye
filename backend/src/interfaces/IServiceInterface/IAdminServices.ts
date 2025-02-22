import { Response } from 'express';
import {
  IUser,
  IAdmin,
  ICategory,
  IOccupation,
  ITransaction,
  IAdminCut,
  IAnnouncement,
  ISurvey,
  CreateAnnouncementParams,
} from '../common.interface';

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
  getAllCategories(active: boolean): Promise<ICategory[]>;
  createCategory(categoryData: Partial<ICategory>): Promise<ICategory>;
  updateCategory(
    categoryId: string,
    categoryData: Partial<ICategory>
  ): Promise<ICategory>;
  toggleCategoryStatus(categoryId: string): Promise<IOccupation>;
  //occupation
  getAllOccupations(active: boolean): Promise<IOccupation[]>;
  createOccupation(OccupationData: Partial<IOccupation>): Promise<IOccupation>;
  toggleOccupationStatus(OccupationId: string): Promise<IOccupation>;
  updateOccupation(
    occupationId: string,
    OccupationData: Partial<IOccupation>
  ): Promise<IOccupation>;
  //transaction
  getAllTransactions(): Promise<ITransaction[]>;
  getAllData(): Promise<any>;
  createAdminCut(percentage: number): Promise<IAdminCut>;
  editAdminCut(percentage: number): Promise<IAdminCut>;
  //announcement
  createAnnouncement(params: CreateAnnouncementParams): Promise<IAnnouncement>;
  getAllAnnouncement(): Promise<IAnnouncement[]>;
  //surveys
  getAllSurveys(): Promise<ISurvey[]>;
  toggleSurveyStatus(SurveyId: string): Promise<ISurvey>;
}
