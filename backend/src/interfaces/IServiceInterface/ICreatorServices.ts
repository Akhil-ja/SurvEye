import { Response, Request } from 'express';
import {
  IUser,
  AuthResponse,
  ISurvey,
  INotification,
  IIncomingSurveyData,
  SurveyAnalytics,
} from '../common.interface';

export interface ICreatorService {
  initiateSignUp(creatorData: {
    email: string;
    phoneNumber: string;
    password: string;
    creatorName: string;
    industry: string;
  }): Promise<{ message: string; pendingUserId: string }>;
  verifyOTPAndCreateCreator(
    pendingUserId: string,
    otp: string,
    res: Response
  ): Promise<IUser>;
  sendOTPForForgotPassword(email: string, res: Response): Promise<void>;
  signIn(
    email: string,
    password: string,
    res: Response,
    req: Request
  ): Promise<AuthResponse>;
  verifyOTPAndSignIn(
    email: string,
    otp: string,
    res: Response,
    req: Request
  ): Promise<AuthResponse>;
  getProfile(userId: string): Promise<any>;
  editProfile(
    userId: string,
    updates: {
      creator_name?: string;
      industry?: string;
    }
  ): Promise<IUser>;
  changePassword(
    userId: string,
    updates: {
      oldPassword?: string;
      newPassword?: string;
    }
  ): Promise<IUser>;
  createSurvey(
    creatorId: string,
    surveyData: {
      surveyName: string;
      description: string;
      categories: string[];
      creatorName: string;
      sampleSize: number;
      targetAgeRange: {
        isAllAges: boolean;
        minAge?: number;
        maxAge?: number;
      };
      duration: {
        startDate: Date;
        endDate: Date;
      };
      questions: Array<{
        questionText: string;
        questionType: 'multiple_choice' | 'single_choice' | 'text' | 'rating';
        options?: Array<{ text: string; value: number }>;
        required: boolean;
        pageNumber: number;
      }>;
      occupations: string[];
      isAllOccupations: boolean;
    }
  ): Promise<ISurvey>;
  getSurvey(surveyId: string): Promise<ISurvey>;
  getAllSurveys(creatorId: string): Promise<{ surveys: ISurvey[] }>;
  makeSurvey(
    surveyData: IIncomingSurveyData,
    actionType: string,
    price: number
  ): Promise<ISurvey>;
  publishSurvey(surveyId: string): Promise<ISurvey>;
  getNotifications(
    creatorId: string
  ): Promise<{ notifications: INotification[] }>;
  getSurveyAnalytics(surveyId: string): Promise<SurveyAnalytics>;
}
