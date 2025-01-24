import bcrypt from 'bcrypt';
import User from '../models/usersModel';
import { INotification, IUser } from '../interfaces/common.interface';
import { generateTokens } from '../utils/jwtUtils';
import { generateOTP, sendOTP } from '../utils/otpUtils';
import PendingUser from '../models/pendingUserModel';
import { Request, Response } from 'express';
import { AppError } from '../utils/AppError';
import { ISurvey } from '../models/surveyModel';
import { Survey } from '../models/surveyModel';
import { SurveyResponse } from '../models/surveyresponse';
import Category from '../models/categoryModel';
import Occupation from '../models/occupationModel';
import { Types } from 'mongoose';
import { ISurveyResponse } from '../interfaces/common.interface';
import Notification from '../models/notificationModal';
import socketConfig from '../socketConfig';

interface QuestionAnalytics {
  questionId: Types.ObjectId;
  questionText: string;
  questionType: string;
  totalResponses: number;
  analytics:
    | SingleChoiceAnalytics
    | MultiChoiceAnalytics
    | RatingAnalytics
    | TextAnalytics;
}

interface OptionAnalytics {
  optionId: Types.ObjectId;
  optionText: string;
  count: number;
  percentage: number;
}

interface SingleChoiceAnalytics {
  options: OptionAnalytics[];
}

interface MultiChoiceAnalytics {
  options: OptionAnalytics[];
}

interface RatingAnalytics {
  averageRating: number;
  ratingDistribution: { [key: number]: number };
}

interface TextAnalytics {
  topWords: Array<{ word: string; count: number }>;
}

interface SurveyAnalytics {
  surveyId: string;
  surveyName: string;
  totalResponses: number;
  sampleSize: number;
  questionsAnalytics: QuestionAnalytics[];
}

interface AuthResponse {
  user: IUser;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}
interface IIncomingQuestion {
  type: 'mcq' | 'checkbox' | 'text' | 'rating';
  question: string;
  options: string[];
}

interface IIncomingPage {
  questions: IIncomingQuestion[];
}

interface IIncomingSurveyData {
  surveyId: string;
  pages: IIncomingPage[];
}

export class CreatorService {
  async initiateSignUp(creatorData: {
    email: string;
    phoneNumber: string;
    password: string;
    creatorName: string;
    industry: string;
  }): Promise<{ message: string; pendingUserId: string }> {
    const { email, phoneNumber, password, creatorName, industry } = creatorData;

    const existingCreatorByEmail = await User.findOne({ email });
    if (existingCreatorByEmail) {
      throw new AppError('Creator already exists with this email.', 400);
    }

    const existingCreatorByPhone = await User.findOne({ phoneNumber });
    if (existingCreatorByPhone) {
      throw new AppError('Creator already exists with this phone number.', 400);
    }

    const existingPendingCreatorByEmail = await PendingUser.find({ email });
    if (existingPendingCreatorByEmail.length > 0) {
      await PendingUser.deleteMany({ email });
      console.log(`Deleted duplicate pending signups for ${email}`);
    }

    const existingPendingCreatorByPhone = await PendingUser.find({
      phoneNumber,
    });
    if (existingPendingCreatorByPhone.length > 0) {
      await PendingUser.deleteMany({ phoneNumber });
      console.log(`Deleted duplicate pending signups for ${phoneNumber}`);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const pendingCreator = new PendingUser({
      email,
      phoneNumber,
      password: hashedPassword,
      role: 'creator',
      creatorName,
      industry,
      otp,
      otpExpires,
    });

    await pendingCreator.save();
    await sendOTP(email, otp);
    console.log(`The OTP for ${email} is ${otp}`);

    return {
      message: 'OTP sent for verification',
      pendingUserId: pendingCreator.id,
    };
  }

  // Verify OTP and Create Creator
  async verifyOTPAndCreateCreator(
    pendingUserId: string,
    otp: string,
    res: Response
  ): Promise<IUser> {
    const pendingCreator = await PendingUser.findById(pendingUserId);
    if (!pendingCreator) {
      throw new AppError('Invalid or expired signup request', 400);
    }

    if (pendingCreator.otp !== otp) {
      throw new AppError('Invalid OTP', 400);
    }

    if (pendingCreator.otpExpires < new Date()) {
      throw new AppError('OTP has expired', 400);
    }

    const phoneNumber = pendingCreator.phoneNumber || undefined;

    const newCreator = new User({
      email: pendingCreator.email,
      phoneNumber: phoneNumber,
      password: pendingCreator.password,
      role: 'creator',
      creator_name: pendingCreator.creatorName,
      industry: pendingCreator.industry,
      created_at: new Date(),
      wallets: [],
      days_active: 0,
    });

    await newCreator.save();
    await PendingUser.deleteOne({ _id: pendingUserId });

    const tokens = generateTokens(newCreator.id, newCreator.role);

    res.cookie('user_accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000,
      sameSite: 'strict',
    });

    res.cookie('user_refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'strict',
    });

    socketConfig.sendNotification({
      userId: newCreator.id.toString(),
      title: 'Welcome!!',
      message: `Welcome to SurvEye.`,
      type: 'welcome_message',
    });

    const newNotification = new Notification({
      title: 'Welcome!!!',
      message: `Welcome to SurvEye.`,
      user: new Types.ObjectId(newCreator.id),
      type: 'welcome_message',
    });
    await newNotification.save();

    return newCreator;
  }

  async signIn(
    email: string,
    password: string,
    res: Response,
    req: Request
  ): Promise<AuthResponse> {
    const user = await User.findOne({ email });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role !== 'creator') {
      throw new AppError('User is not authorized as a creator', 401);
    }

    if (user.status === 'blocked') {
      throw new AppError('Creator is blocked', 403);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError('Incorrect password', 401);
    }

    const tokens = generateTokens(user.id, user.role);

    res.cookie('user_accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000,
      sameSite: 'strict',
    });

    res.cookie('user_refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'strict',
    });

    return { user, tokens };
  }

  async sendOTPForForgotPassword(email: string, res: Response): Promise<void> {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('Email not registered', 404);
    }

    if (user.role !== 'creator') {
      throw new AppError('User is not authorized as a creator', 401);
    }

    if (user.status === 'blocked') {
      throw new AppError('User is blocked', 403);
    }

    const otp = generateOTP();
    console.log(`The Forgot OTP for ${email} is ${otp}`);

    res.cookie('resetOTP', otp, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 60 * 1000,
      sameSite: 'strict',
    });

    await sendOTP(user.email, otp);
  }

  // Verify OTP and Sign In
  async verifyOTPAndSignIn(
    email: string,
    otp: string,
    res: Response,
    req: Request
  ): Promise<AuthResponse> {
    const user = await User.findOne({ email });

    if (!user) {
      throw new AppError('Email not registered', 404);
    }

    if (user.role !== 'creator') {
      throw new AppError('User is not authorized as a creator', 401);
    }

    if (user.status === 'blocked') {
      throw new AppError('Creator is blocked', 403);
    }

    const storedOTP = req.cookies.resetOTP;

    if (!storedOTP) {
      throw new AppError('No OTP found', 400);
    }

    if (otp !== storedOTP) {
      throw new AppError('Invalid OTP', 400);
    }

    res.clearCookie('resetOTP');

    const tokens = generateTokens(user.id, user.role);

    res.cookie('user_accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000,
      sameSite: 'strict',
    });

    res.cookie('user_refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'strict',
    });

    return { user, tokens };
  }

  async getProfile(userId: string): Promise<any> {
    const creator = await User.findById(userId).select('-password');

    if (!creator) {
      throw new AppError('Creator not found', 404);
    }

    if (creator.role !== 'creator') {
      throw new AppError('User is not authorized as a creator', 401);
    }

    if (creator.status === 'blocked') {
      throw new AppError('Creator is blocked', 403);
    }

    return {
      id: creator.id,
      number: creator.phoneNumber,
      email: creator.email,
      role: creator.role,
      creator_name: creator.creator_name,
      industry: creator.industry,
    };
  }

  async editProfile(
    userId: string,
    updates: {
      creator_name?: string;
      industry?: string;
    }
  ): Promise<IUser> {
    const creator = await User.findById(userId);

    if (!creator) {
      throw new AppError('Creator not found', 404);
    }

    if (creator.role !== 'creator') {
      throw new AppError('User is not authorized as a creator', 401);
    }

    if (creator.status === 'blocked') {
      throw new AppError('Creator is blocked', 403);
    }

    if (updates.creator_name && updates.creator_name.trim().length === 0) {
      throw new AppError('Creator name cannot be empty', 400);
    }

    if (updates.industry && updates.industry.trim().length === 0) {
      throw new AppError('Industry cannot be empty', 400);
    }

    if (updates.creator_name) {
      creator.creator_name = updates.creator_name.trim();
    }

    if (updates.industry) {
      creator.industry = updates.industry.trim();
    }

    await creator.save();

    return creator;
  }

  async changePassword(
    userId: string,
    updates: {
      oldPassword?: string;
      newPassword?: string;
    }
  ): Promise<IUser> {
    const creator = await User.findById(userId);

    if (!creator) {
      throw new AppError('Creator not found', 404);
    }

    if (creator.role !== 'creator') {
      throw new AppError('User is not authorized as a creator', 401);
    }

    if (creator.status === 'blocked') {
      throw new AppError('Creator is blocked', 403);
    }

    if (updates.oldPassword && updates.newPassword) {
      const isMatch = await bcrypt.compare(
        updates.oldPassword,
        creator.password
      );

      if (!isMatch) {
        throw new AppError('Old password is incorrect', 400);
      }

      const isSamePassword = await bcrypt.compare(
        updates.newPassword,
        creator.password
      );

      if (isSamePassword) {
        throw new AppError(
          'New password cannot be the same as the old password',
          400
        );
      }

      const salt = await bcrypt.genSalt(10);
      creator.password = await bcrypt.hash(updates.newPassword, salt);
    }

    await creator.save();

    return creator;
  }

  async createSurvey(
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
  ): Promise<ISurvey> {
    const creator = await User.findById(creatorId);

    if (!creator) {
      throw new AppError('Creator not found', 404);
    }

    if (creator.role !== 'creator') {
      throw new AppError('User is not authorized as a creator', 401);
    }

    if (creator.status === 'blocked') {
      throw new AppError('Creator is blocked', 403);
    }

    const categoryCount = await Category.countDocuments({
      _id: { $in: surveyData.categories },
    });
    if (categoryCount !== surveyData.categories.length) {
      throw new AppError('One or more categories are invalid', 400);
    }

    if (!surveyData.isAllOccupations && surveyData.occupations.length > 0) {
      const occupationCount = await Occupation.countDocuments({
        _id: { $in: surveyData.occupations },
      });
      if (occupationCount !== surveyData.occupations.length) {
        throw new AppError('One or more occupations are invalid', 400);
      }
    }

    const survey = new Survey({
      creator: creatorId,
      surveyName: surveyData.surveyName,
      description: surveyData.description,
      categories: surveyData.categories,
      creatorName: surveyData.creatorName,
      sampleSize: surveyData.sampleSize,
      targetAgeRange: surveyData.targetAgeRange,
      duration: surveyData.duration,
      questions: surveyData.questions,
      occupations: surveyData.occupations,
      isAllOccupations: surveyData.isAllOccupations,

      created_at: new Date(),
      updated_at: new Date(),
    });

    await survey.save();

    return survey;
  }

  async getSurvey(surveyId: string): Promise<ISurvey> {
    const survey = await Survey.findById(surveyId)
      .populate('categories')
      .populate('occupations');

    if (!survey) {
      throw new AppError('Survey not found', 404);
    }

    return survey;
  }

  async getAllSurveys(creatorId: string): Promise<{ surveys: ISurvey[] }> {
    const surveys = await Survey.find({ creator: creatorId }).populate(
      'categories',
      'name'
    );

    if (surveys.length === 0) {
      throw new AppError('No active surveys found.', 404);
    }

    return { surveys };
  }

  private mapQuestionType(
    type: string
  ): 'multiple_choice' | 'single_choice' | 'text' | 'rating' {
    switch (type) {
      case 'mcq':
        return 'single_choice';
      case 'checkbox':
        return 'multiple_choice';
      case 'text':
        return 'text';
      case 'rating':
        return 'rating';
      default:
        throw new Error(`Invalid question type: ${type}`);
    }
  }

  private transformQuestions(pages: IIncomingPage[]): any[] {
    let transformedQuestions: any[] = [];
    let pageNumber = 1;

    pages.forEach((page) => {
      const pageQuestions = page.questions.map((q) => ({
        questionText: q.question,
        questionType: this.mapQuestionType(q.type),
        options: q.options.map((opt, index) => ({
          text: opt,
          value: index + 1,
        })),
        required: true,
        pageNumber: pageNumber,
      }));

      transformedQuestions = [...transformedQuestions, ...pageQuestions];
      pageNumber++;
    });

    return transformedQuestions;
  }

  async makeSurvey(
    surveyData: IIncomingSurveyData,
    actionType: string,
    price: number
  ): Promise<ISurvey> {
    const { surveyId, pages } = surveyData;

    const status = actionType === 'active' ? 'active' : 'draft';
    let isPublished = false;

    if (surveyId) {
      const existingSurvey = await Survey.findById(surveyId);
      if (!existingSurvey) {
        throw new Error('Survey not found');
      }
      isPublished = existingSurvey.duration?.startDate < new Date();
      existingSurvey.isPublished = isPublished;
      existingSurvey.questions = this.transformQuestions(pages);
      existingSurvey.updated_at = new Date();
      existingSurvey.status = status;
      existingSurvey.price = price;

      await existingSurvey.save();
      return existingSurvey;
    }

    const survey = new Survey({
      questions: this.transformQuestions(pages),
      status,
      isPublished,
    });

    await survey.save();
    return survey;
  }

  async publishSurvey(surveyId: string): Promise<ISurvey> {
    const survey = await Survey.findById(surveyId).populate(
      'categories',
      'name'
    );

    if (!survey) {
      throw new AppError('Survey not found', 404);
    }

    if (survey.status === 'active') {
      throw new AppError('Survey is already published', 400);
    }
    survey.status = 'active';
    await survey.save();

    return survey;
  }

  private async getResponsesBySurveyId(
    surveyId: string
  ): Promise<ISurveyResponse[]> {
    return await SurveyResponse.find({ survey: surveyId });
  }

  private calculateOptionAnalytics(
    responses: ISurveyResponse[],
    questionId: Types.ObjectId,
    options: any[]
  ): OptionAnalytics[] {
    const optionCounts = new Map<string, number>();

    options.forEach((option) => {
      optionCounts.set(option._id.toString(), 0);
    });

    responses.forEach((response) => {
      const answer = response.answers.find((a) =>
        a.questionId.equals(questionId)
      );
      if (answer?.selectedOptions) {
        answer.selectedOptions.forEach((optionId) => {
          const key = optionId.toString();
          optionCounts.set(key, (optionCounts.get(key) || 0) + 1);
        });
      }
    });

    const totalResponses = responses.length;
    return options.map((option) => ({
      optionId: option._id,
      optionText: option.text,
      count: optionCounts.get(option._id.toString()) || 0,
      percentage:
        ((optionCounts.get(option._id.toString()) || 0) / totalResponses) * 100,
    }));
  }

  private calculateRatingAnalytics(
    responses: ISurveyResponse[],
    questionId: Types.ObjectId
  ): RatingAnalytics {
    const ratings: number[] = [];
    const distribution: { [key: number]: number } = {};

    responses.forEach((response) => {
      const answer = response.answers.find((a) =>
        a.questionId.equals(questionId)
      );
      if (answer?.ratingValue) {
        ratings.push(answer.ratingValue);
        distribution[answer.ratingValue] =
          (distribution[answer.ratingValue] || 0) + 1;
      }
    });

    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : 0;

    return {
      averageRating,
      ratingDistribution: distribution,
    };
  }

  private calculateTextAnalytics(
    responses: ISurveyResponse[],
    questionId: Types.ObjectId
  ): TextAnalytics {
    const wordCount = new Map<string, number>();
    const stopWords = new Set([
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'by',
    ]);

    responses.forEach((response) => {
      const answer = response.answers.find((a) =>
        a.questionId.equals(questionId)
      );
      if (answer?.textAnswer) {
        const words = answer.textAnswer
          .toLowerCase()
          .replace(/[^\w\s]/g, '')
          .split(/\s+/)
          .filter((word) => !stopWords.has(word));

        words.forEach((word) => {
          wordCount.set(word, (wordCount.get(word) || 0) + 1);
        });
      }
    });

    const topWords = Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([word, count]) => ({ word, count }));

    return { topWords };
  }

  async getNotifications(
    creatorId: string
  ): Promise<{ notifications: INotification[] }> {
    const notifications = await Notification.find({
      user: creatorId,
    });

    if (notifications.length === 0) {
      throw new AppError('No notifications found.', 404);
    }

    return { notifications };
  }

  async getSurveyAnalytics(surveyId: string): Promise<SurveyAnalytics> {
    const survey = await Survey.findById<ISurvey>(surveyId);
    if (!survey) {
      throw new Error('Survey not found');
    }

    const responses = await this.getResponsesBySurveyId(surveyId);

    const questionsAnalytics: QuestionAnalytics[] = await Promise.all(
      survey.questions.map(async (question) => {
        let analytics: any;

        switch (question.questionType) {
          case 'single_choice':
            analytics = {
              options: this.calculateOptionAnalytics(
                responses,
                question._id,
                question.options
              ),
            };
            break;

          case 'multiple_choice':
            analytics = {
              options: this.calculateOptionAnalytics(
                responses,
                question._id,
                question.options
              ),
            };
            break;

          case 'rating':
            analytics = this.calculateRatingAnalytics(responses, question._id);
            break;

          case 'text':
            analytics = this.calculateTextAnalytics(responses, question._id);
            break;
        }

        return {
          questionId: question._id,
          questionText: question.questionText,
          questionType: question.questionType,
          totalResponses: responses.length,
          analytics,
        };
      })
    );

    return {
      surveyId: survey._id.toString(),
      surveyName: survey.surveyName,
      sampleSize: survey.sampleSize,
      totalResponses: responses.length,
      questionsAnalytics,
    };
  }
}

export const creatorService = new CreatorService();
