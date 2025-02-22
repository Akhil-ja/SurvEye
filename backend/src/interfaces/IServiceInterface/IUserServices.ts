import { Request, Response } from 'express';
import { IUser, ISurvey } from '../common.interface';
import { ResponseData } from '../../types/responseSurveyTypes';

export interface AuthResponse {
  user: IUser;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface IUserService {
  // Authentication & User Management
  initiateSignUp(userData: {
    email: string;
    phoneNumber: string;
    password: string;
    role: 'user';
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
  }): Promise<{ message: string; pendingUserId: string }>;

  verifyOTPAndCreateUser(
    pendingUserId: string,
    otp: string,
    res: Response
  ): Promise<IUser>;

  signIn(
    email: string,
    password: string,
    res: Response,
    req: Request
  ): Promise<AuthResponse>;

  sendOTPForForgotPassword(email: string, res: Response): Promise<void>;

  verifyOTPAndSignIn(
    email: string,
    otp: string,
    res: Response,
    req: Request
  ): Promise<AuthResponse>;

  Logout(res: Response, req: Request): Promise<void>;

  // Profile Management
  getProfile(userId: string): Promise<any>;

  editProfile(
    userId: string,
    updates: {
      firstName?: string;
      lastName?: string;
    }
  ): Promise<IUser>;

  changePassword(
    userId: string,
    updates: {
      oldPassword?: string;
      newPassword?: string;
    }
  ): Promise<IUser>;

  // Survey Operations
  getActiveSurveys(
    page?: number,
    limit?: number,
    sortBy?: string,
    order?: 'asc' | 'desc',
    attended?: boolean,
    userId?: string
  ): Promise<{
    surveys: ISurvey[];
    currentPage: number;
    totalPages: number;
    totalSurveys: number;
  }>;

  getSurveyinfo(surveyId: string): Promise<{
    survey: ISurvey | null;
  }>;

  submitResponse(
    surveyId: string,
    userId: string,
    responses: ResponseData[]
  ): Promise<any>;
}
