import bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import { IUser } from '../interfaces/common.interface';
import { generateTokens } from '../utils/jwtUtils';
import { generateOTP, sendOTP } from '../utils/otpUtils';
import { Request, Response } from 'express';
import { AppError } from '../utils/AppError';
import { ISurvey } from '../models/surveyModel';
import { Survey } from '../models/surveyModel';
import { ResponseData } from '../types/responseSurveyTypes';
import moment from 'moment';
import { ICategory, AuthResponse } from '../interfaces/common.interface';
import Category from '../models/categoryModel';
import Occupation from '../models/occupationModel';
import mongoose from 'mongoose';
import * as web3 from '@solana/web3.js';
import bs58 from 'bs58';
import AdminCut from '../models/adminCutModal';
import socketConfig from '../socketConfig';
import { IUserService } from '../interfaces/IServiceInterface/IUserServices';
import { ISurveyRepository } from '../interfaces/IRepositoryInterface/ISurveyRepository';
import { INotificationRepository } from '../interfaces/IRepositoryInterface/INotificationRepository';
import { ITransactionRepository } from '../interfaces/IRepositoryInterface/ITransactionRepository';
import { IUserRepository } from '../interfaces/IRepositoryInterface/IUserRepository';
import { ISurveyResponseRepository } from '../interfaces/IRepositoryInterface/ISurveyResponseRepository';
import { IWalletRepository } from '../interfaces/IRepositoryInterface/IWalletRepository';
import { ICategoryRepository } from '../interfaces/IRepositoryInterface/ICategoryRepository';
export class UserService implements IUserService {
  constructor(
    private readonly surveyRepository: ISurveyRepository,
    private readonly notificationRepository: INotificationRepository,
    private readonly transationRepository: ITransactionRepository,
    private readonly userRepository: IUserRepository,
    private readonly surveyResponseRepository: ISurveyResponseRepository,
    private readonly walletRepository: IWalletRepository,
    private readonly categoryRepository: ICategoryRepository
  ) {}

  async initiateSignUp(userData: {
    email: string;
    phoneNumber: string;
    password: string;
    role: 'user';
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
  }): Promise<{ message: string; pendingUserId: string }> {
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new AppError('User already exists', 400);
    }

    const existingPendingUser =
      await this.userRepository.findPendingUsersByEmail(userData.email);
    if (existingPendingUser.length > 0) {
      await this.userRepository.deletePendingUsersByEmail(userData.email);
      console.log(`Deleted duplicate pending signups for ${userData.email}`);
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const pendingUser = await this.userRepository.createPendingUser({
      ...userData,
      password: hashedPassword,
      otp,
      otpExpires,
      dateOfBirth: userData.dateOfBirth
        ? new Date(userData.dateOfBirth)
        : undefined,
    });

    await sendOTP(userData.email, otp);
    console.log(`The OTP for ${userData.email} is ${otp}`);

    return {
      message: 'OTP sent for verification',
      pendingUserId: pendingUser.id,
    };
  }

  async verifyOTPAndCreateUser(
    pendingUserId: string,
    otp: string,
    res: Response
  ): Promise<IUser> {
    const pendingUser =
      await this.userRepository.findPendingUserById(pendingUserId);
    if (!pendingUser) {
      throw new AppError('Invalid or expired signup request', 400);
    }

    if (pendingUser.otp !== otp) {
      throw new AppError('Invalid OTP', 400);
    }

    if (pendingUser.otpExpires < new Date()) {
      throw new AppError('OTP has expired', 400);
    }

    const phoneNumber = pendingUser.phoneNumber || undefined;

    const newUser = await this.userRepository.createUser({
      email: pendingUser.email,
      phoneNumber: phoneNumber,
      password: pendingUser.password,
      role: 'user',
      first_name: pendingUser.firstName,
      last_name: pendingUser.lastName,
      date_of_birth: pendingUser.dateOfBirth,
      created_at: new Date(),
      wallet: null,
      days_active: 0,
    });

    await newUser.save();
    await this.userRepository.deletePendingUserById(pendingUserId);

    const tokens = generateTokens(newUser.id, newUser.role);

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

    return newUser;
  }

  async signIn(
    email: string,
    password: string,
    res: Response,
    req: Request
  ): Promise<AuthResponse> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new AppError('Email not registered', 404);
    }

    if (user.role !== 'user') {
      throw new AppError('User is not authorized as a user', 403);
    }

    if (user.status === 'blocked') {
      throw new AppError('User is blocked', 403);
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
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Email not registered', 404);
    }

    if (user.role !== 'user') {
      throw new AppError('User is not authorized as a user', 403);
    }

    if (user.status === 'blocked') {
      throw new AppError('User is blocked or inactive', 403);
    }

    const otp = generateOTP();
    console.log(`the Forgot OTP is ${otp}`);

    res.cookie('resetOTP', otp, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 60 * 1000,
      sameSite: 'strict',
    });

    await sendOTP(user.email, otp);
  }

  async verifyOTPAndSignIn(
    email: string,
    otp: string,
    res: Response,
    req: Request
  ): Promise<AuthResponse> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new AppError('Email not registered', 404);
    }

    if (user.role !== 'user') {
      throw new AppError('User is not authorized as a user', 403);
    }

    if (user.status === 'blocked') {
      throw new AppError('User is blocked', 403);
    }

    const storedOTP = req.cookies.resetOTP;

    if (!storedOTP) {
      console.log('OTP not found in cookies');
      throw new AppError('No OTP found', 400);
    }

    if (otp !== storedOTP) {
      console.log('OTP mismatch. Provided:', otp, 'Stored:', storedOTP);
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

    return {
      user,
      tokens,
    };
  }

  async Logout(res: Response, req: Request): Promise<void> {
    res.clearCookie('user', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
  }

  async getProfile(userId: string): Promise<any> {
    const user = await this.userRepository.findUserWithOccupation(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role !== 'user') {
      throw new AppError('User is not authorized as a user', 401);
    }

    if (user.status === 'blocked') {
      throw new AppError('User is blocked', 403);
    }

    const age = moment().diff(moment(user.date_of_birth), 'years');

    return {
      id: user.id,
      number: user.phoneNumber,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      age: age,
      occupation: user.occupation ? user.occupation : null,
      wallet: user.wallet || null,
    };
  }

  async editProfile(
    userId: string,
    updates: {
      firstName?: string;
      lastName?: string;
      dateOfBirth?: string;
      occupation?: string;
    }
  ): Promise<IUser> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role !== 'user') {
      throw new AppError('User is not authorized as a user', 401);
    }

    if (user.status === 'blocked') {
      throw new AppError('User is blocked', 403);
    }

    if (updates.firstName && updates.firstName.trim().length === 0) {
      throw new AppError('First name cannot be empty', 400);
    }

    if (
      updates.lastName !== undefined &&
      updates.lastName.trim().length === 0
    ) {
      throw new AppError('Last name cannot be empty if provided', 400);
    }

    if (updates.dateOfBirth) {
      const dobDate = moment(updates.dateOfBirth);

      if (!dobDate.isValid()) {
        throw new AppError('Invalid date format', 400);
      }

      if (dobDate.isAfter(moment())) {
        throw new AppError('Date of birth cannot be in the future', 400);
      }

      const age = moment().diff(dobDate, 'years');
      if (age > 120) {
        throw new AppError('Invalid date of birth', 400);
      }

      user.date_of_birth = dobDate.toDate();
    }

    if (updates.occupation) {
      const occupationId = new mongoose.Types.ObjectId(updates.occupation);

      const occupationExists = await Occupation.findById(occupationId);

      if (!occupationExists) {
        throw new AppError('Invalid occupation', 400);
      }

      user.occupation = occupationId;
    }

    if (updates.firstName) {
      user.first_name = updates.firstName.trim();
    }

    if (updates.lastName) {
      user.last_name = updates.lastName.trim();
    }

    await user.save();

    return user;
  }

  async changePassword(
    userId: string,
    updates: {
      oldPassword?: string;
      newPassword?: string;
    }
  ): Promise<IUser> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role !== 'user') {
      throw new AppError('User is not authorized as a user', 401);
    }

    if (user.status === 'blocked') {
      throw new AppError('User is blocked', 403);
    }

    if (updates.oldPassword && updates.newPassword) {
      const isMatch = await bcrypt.compare(updates.oldPassword, user.password);

      if (!isMatch) {
        throw new AppError('Old password is incorrect', 400);
      }

      const isSamePassword = await bcrypt.compare(
        updates.newPassword,
        user.password
      );

      if (isSamePassword) {
        throw new AppError(
          'New password cannot be the same as the old password',
          400
        );
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(updates.newPassword, salt);
    }

    await user.save();

    return user;
  }

  async getActiveSurveys(
    page: number = 1,
    limit: number = 6,
    sortBy: string = 'createdAt',
    order: 'asc' | 'desc' = 'desc',
    attended: boolean,
    userId?: string
  ): Promise<{
    surveys: ISurvey[];
    currentPage: number;
    totalPages: number;
    totalSurveys: number;
  }> {
    const skip = (page - 1) * limit;
    const sortOptions: Record<string, any> = {
      name: { surveyName: order === 'asc' ? 1 : -1 },
      date: { 'duration.startDate': order === 'desc' ? -1 : 1 },
      responses: { totalResponses: order === 'desc' ? -1 : 1 },
      createdAt: { created_at: order === 'desc' ? -1 : 1 },
    };

    const sortCriteria = sortOptions[sortBy] || { created_at: -1 };
    const currentDate = new Date();

    let userAge: number | undefined;
    let userOccupation;

    if (userId) {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (!user.date_of_birth) {
        console.warn(`User ${userId} has no date of birth set`);
      } else {
        const birthDate = new Date(user.date_of_birth);
        const ageDiff = currentDate.getTime() - birthDate.getTime();
        userAge = Math.floor(ageDiff / (1000 * 60 * 60 * 24 * 365.25));
      }

      userOccupation = user.occupation;
    }

    const ageCondition =
      userAge !== undefined
        ? {
            $or: [
              { 'targetAgeRange.isAllAges': true },
              { 'targetAgeRange.isAllAges': { $exists: false } },
              {
                $and: [
                  {
                    $or: [
                      { 'targetAgeRange.minAge': { $lte: userAge } },
                      { 'targetAgeRange.minAge': { $exists: false } },
                    ],
                  },
                  {
                    $or: [
                      { 'targetAgeRange.maxAge': { $gte: userAge } },
                      { 'targetAgeRange.maxAge': { $exists: false } },
                    ],
                  },
                ],
              },
            ],
          }
        : {};

    try {
      let query: any = {};

      if (attended && userId) {
        const attendedSurveyResponses =
          await this.surveyResponseRepository.findAttendedSurveys(userId);

        const attendedSurveyIds = attendedSurveyResponses.map(
          (response: any) => response.survey
        );

        query = {
          _id: { $in: attendedSurveyIds },
          ...ageCondition,
        };
      } else {
        const occupationCondition = {
          $or: [
            { isAllOccupations: true },
            {
              $and: [
                { isAllOccupations: { $ne: true } },
                {
                  $or: [{ occupations: { $in: [userOccupation] } }],
                },
              ],
            },
          ],
        };

        query = {
          status: 'active',
          'duration.startDate': { $lte: currentDate },
          'duration.endDate': { $gte: currentDate },
          ...ageCondition,
          ...occupationCondition,
          questions: { $exists: true, $ne: [], $not: { $size: 0 } },
        };
      }

      const surveys = (await Survey.find(query)
        .populate('categories', 'name')
        .populate('occupations', 'name')
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .lean()) as ISurvey[];

      const [totalSurveys] = await Promise.all([Survey.countDocuments(query)]);

      if (totalSurveys === 0) {
        return {
          surveys: [],
          currentPage: page,
          totalPages: 0,
          totalSurveys: 0,
        };
      }

      return {
        surveys,
        currentPage: page,
        totalPages: Math.ceil(totalSurveys / limit),
        totalSurveys,
      };
    } catch (error) {
      console.error('Error in getActiveSurveys:', error);
      throw new AppError('Failed to fetch surveys', 500);
    }
  }

  async getSurveyinfo(surveyId: string): Promise<{
    survey: ISurvey | null;
  }> {
    const survey = await Survey.findOne({
      _id: surveyId,
      status: 'active',
    });

    return {
      survey,
    };
  }

  async submitResponse(
    surveyId: string,
    userId: string,
    responses: ResponseData[]
  ) {
    const user =
      await this.userRepository.findUserWithWalletWithoutLean(userId);

    if (!user) {
      throw new AppError('user not found', 400);
    }

    if (!user.wallet) {
      const newWallet = await this.walletRepository.createWallet({
        userId: user._id as string,
        network: 'devnet',
      });

      user.wallet = newWallet._id;
      await user.save();
    }

    const survey = await Survey.findById(surveyId);
    if (!survey) {
      throw new AppError('Survey not found', 404);
    }

    if (survey.status !== 'active') {
      throw new AppError('Survey is not active', 400);
    }

    const currentDate = new Date();
    if (
      currentDate < survey.duration.startDate ||
      currentDate > survey.duration.endDate
    ) {
      throw new AppError('Survey is not within its active duration', 400);
    }

    const existingResponse =
      await this.surveyResponseRepository.findExistingResponse(
        surveyId,
        userId
      );
    if (existingResponse) {
      throw new AppError(
        'You have already submitted a response to this survey',
        400
      );
    }

    const requiredQuestionIds = survey.questions
      .filter((q) => q.required)
      .map((q) => q._id.toString());

    const answeredQuestionIds = responses.map((r) => r.questionId);
    const missingRequiredQuestions = requiredQuestionIds.filter(
      (qId) => !answeredQuestionIds.includes(qId)
    );

    if (missingRequiredQuestions.length > 0) {
      throw new AppError('All required questions must be answered', 400);
    }

    const formattedAnswers = await Promise.all(
      responses.map(async (response) => {
        const question = survey.questions.find(
          (q) => q._id.toString() === response.questionId.toString()
        );

        if (!question) {
          throw new AppError(
            `Invalid question ID: ${response.questionId}`,
            400
          );
        }

        const formattedAnswer: {
          questionId: Types.ObjectId;
          questionText: string;
          selectedOptions?: Types.ObjectId[];
          textAnswer?: string;
          ratingValue?: number;
        } = {
          questionId: question._id,
          questionText: question.questionText,
        };

        switch (question.questionType) {
          case 'single_choice':
          case 'rating':
            if (Array.isArray(response.answer)) {
              throw new AppError(
                `Question ${response.questionId} requires a single answer`,
                400
              );
            }
            if (question.questionType === 'single_choice') {
              const validOption = question.options.find(
                (opt) => opt.value.toString() === response.answer
              );
              if (!validOption) {
                throw new AppError(
                  `Invalid option for question ${response.questionId}`,
                  400
                );
              }
              formattedAnswer.selectedOptions = [
                validOption._id as Types.ObjectId,
              ];
            } else {
              const rating = parseInt(response.answer);
              if (isNaN(rating) || rating < 1 || rating > 5) {
                throw new AppError(
                  `Invalid rating value for question ${response.questionId}`,
                  400
                );
              }
              formattedAnswer.ratingValue = rating;
            }
            break;

          case 'multiple_choice': {
            if (!Array.isArray(response.answer)) {
              throw new AppError(
                `Question ${response.questionId} requires multiple answers`,
                400
              );
            }
            const validOptions = response.answer.map((ans) => {
              const option = question.options.find(
                (opt) => opt.value.toString() === ans
              );
              if (!option) {
                throw new AppError(
                  `Invalid option "${ans}" for question ${response.questionId}`,
                  400
                );
              }
              return option._id;
            });
            formattedAnswer.selectedOptions = validOptions as Types.ObjectId[];

            break;
          }

          case 'text':
            if (Array.isArray(response.answer)) {
              throw new AppError(
                `Question ${response.questionId} requires a text answer`,
                400
              );
            }
            formattedAnswer.textAnswer = response.answer;
            break;

          default:
            throw new AppError(
              `Unsupported question type for question ${response.questionId}`,
              400
            );
        }

        return formattedAnswer;
      })
    );

    const percentCut = await AdminCut.findOne();

    if (!percentCut || percentCut.percentage === undefined) {
      throw new AppError('Admin percentage not found', 400);
    }

    const totalSurveyPrice = survey.price;
    const sampleSize = survey.sampleSize;

    const adminCut = totalSurveyPrice * (percentCut.percentage / 100);

    const remainingAmount = totalSurveyPrice - adminCut;

    const payoutAmount = parseFloat((remainingAmount / sampleSize).toFixed(3));

    await this.walletRepository.incrementPayout(
      user.wallet._id.toString(),
      payoutAmount
    );

    const surveyResponse = this.surveyResponseRepository.createSurveyResponse({
      survey: new Types.ObjectId(surveyId),
      user: new Types.ObjectId(userId),
      answers: formattedAnswers,
      completedAt: new Date(),
    });

    await Survey.findByIdAndUpdate(surveyId, {
      $inc: { totalResponses: 1 },
    });

    socketConfig.sendNotification({
      userId: userId,
      title: 'Survey Reward',
      message: `You have earned ${payoutAmount} for completing the survey "${survey.surveyName}".`,
      type: 'survey_reward',
    });

    const updatedSurvey = (await Survey.findById(surveyId)) as ISurvey;

    if (updatedSurvey.totalResponses === survey.sampleSize) {
      await Survey.findByIdAndUpdate(surveyId, {
        status: 'completed',
      });

      socketConfig.sendNotification({
        userId: survey.creator.toString(),
        title: 'Survey Completed',
        message: `Your survey "${survey.surveyName}" has reached its target sample size.`,
        type: 'reward',
      });

      const newNotification = await this.notificationRepository.create({
        title: 'Survey Completed',
        message: `Your survey "${survey.surveyName}" has reached its target sample size.`,
        user: new Types.ObjectId(survey.creator),
        type: 'survey_completion',
      });
    }

    return surveyResponse;
  }

  async getAllCategories(active: boolean): Promise<ICategory[]> {
    let categories: ICategory[];

    if (active) {
      categories = await this.categoryRepository.getCategoriesByStatus(active);
    } else {
      categories = await this.categoryRepository.getAllCategoriesUnfiltered();
    }

    if (!categories || categories.length === 0) {
      throw new AppError('No categories found', 404);
    }

    return categories;
  }

  async sendSOL(
    senderPrivateKey: string,
    recipientPublicAddress: string,
    amountInSol: number,
    userId: string
  ): Promise<string> {
    const connection = new web3.Connection(
      web3.clusterApiUrl('devnet'),
      'confirmed'
    );

    const privateKeyBytes = bs58.decode(senderPrivateKey);

    const senderKeypair = web3.Keypair.fromSecretKey(privateKeyBytes);

    const senderPublicKey = senderKeypair.publicKey;
    const balance = await connection.getBalance(senderPublicKey);
    const balanceInSol = balance / web3.LAMPORTS_PER_SOL;

    const amountInLamports = Math.floor(amountInSol * web3.LAMPORTS_PER_SOL);

    const feeInLamports = 5000;

    if (balanceInSol < amountInSol + feeInLamports / web3.LAMPORTS_PER_SOL) {
      throw new Error(
        `Insufficient balance. Current balance: ${balanceInSol.toFixed(4)} SOL, Required: ${(amountInSol + feeInLamports / web3.LAMPORTS_PER_SOL).toFixed(4)} SOL`
      );
    }

    const recipientPublicKey = new web3.PublicKey(recipientPublicAddress);

    const transaction = new web3.Transaction().add(
      web3.SystemProgram.transfer({
        fromPubkey: senderPublicKey,
        toPubkey: recipientPublicKey,
        lamports: amountInLamports,
      })
    );

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = senderPublicKey;

    transaction.sign(senderKeypair);

    const signedTransactionBuffer = transaction.serialize();

    const signature = await connection.sendRawTransaction(
      signedTransactionBuffer
    );

    const confirmation = await connection.confirmTransaction(signature);

    if (confirmation.value.err) {
      throw new Error('Transaction failed');
    }

    await this.transationRepository.makeTransaction({
      user: userId,
      type: 'credit',
      sender: senderPublicKey.toBase58(),
      recipient: recipientPublicKey.toBase58(),
      amount: amountInSol,
      signature,
      status: 'completed',
    });

    return signature;
  }

  async payout(userId: string): Promise<string> {
    const connection = new web3.Connection(
      web3.clusterApiUrl('devnet'),
      'confirmed'
    );

    const user =
      await this.userRepository.findUserWithWalletWithoutLean(userId);
    if (!user || !user.wallet) {
      throw new AppError('User or wallet not found', 404);
    }

    const wallet = await this.walletRepository.lockPayout(
      user.wallet._id.toString()
    );
    if (!wallet) {
      throw new AppError('Payout is already in progress for this user', 400);
    }

    const senderPrivateKey = process.env.ADMIN_PRIVATE_KEY;
    if (!senderPrivateKey) {
      await this.walletRepository.unlockPayout(wallet.id);
      throw new AppError('Admin private key is missing', 500);
    }

    const privateKeyBytes = bs58.decode(senderPrivateKey);
    const senderKeypair = web3.Keypair.fromSecretKey(privateKeyBytes);
    const senderPublicKey = senderKeypair.publicKey;

    const balance = await connection.getBalance(senderPublicKey);
    const balanceInSol = balance / web3.LAMPORTS_PER_SOL;
    const amountInSol = wallet.payout;
    const amountInLamports = Math.floor(amountInSol * web3.LAMPORTS_PER_SOL);
    const feeInLamports = 5000;

    if (balanceInSol < amountInSol + feeInLamports / web3.LAMPORTS_PER_SOL) {
      await this.walletRepository.unlockPayout(wallet._id.toString());
      throw new AppError(
        `Insufficient balance. Current balance: ${balanceInSol.toFixed(4)} SOL, Required: ${(amountInSol + feeInLamports / web3.LAMPORTS_PER_SOL).toFixed(4)} SOL`,
        400
      );
    }

    const recipientPublicKey = new web3.PublicKey(wallet.publicAddress);

    const transaction = new web3.Transaction().add(
      web3.SystemProgram.transfer({
        fromPubkey: senderPublicKey,
        toPubkey: recipientPublicKey,
        lamports: amountInLamports,
      })
    );

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = senderPublicKey;
    transaction.sign(senderKeypair);

    try {
      const signedTransactionBuffer = transaction.serialize();
      const signature = await connection.sendRawTransaction(
        signedTransactionBuffer
      );
      const confirmation = await connection.confirmTransaction(signature);

      if (confirmation.value.err) {
        throw new Error('Transaction failed');
      }

      wallet.payout = 0;
      wallet.isPayoutLocked = false;
      await wallet.save();

      await this.transationRepository.makeTransaction({
        user: userId,
        type: 'payout',
        sender: senderPublicKey,
        recipient: recipientPublicKey,
        amount: amountInSol,
        signature,
        status: 'completed',
      });

      return signature;
    } catch (error) {
      console.error('Error during transaction:', error);
      await this.walletRepository.unlockPayout(wallet._id.toString());
      throw new AppError('Transaction failed, please try again', 500);
    }
  }
}
