import bcrypt from "bcrypt";
import User from "../models/usersModel";
import { IUser } from "../models/usersModel";
import { generateToken } from "../utils/jwtUtils";
import PendingUser from "../models/pendingUserModel";
import { generateOTP, sendOTP } from "../utils/otpUtils";
import { Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { ISurvey } from "../models/surveyModel";
import { Survey } from "../models/surveyModel";
import { SurveyResponse } from "../models/surveyresponse";
import { Types } from "mongoose";
import { ResponseData, IQuestion } from "../types/responseSurveyTypes";

export class UserService {
  async initiateSignUp(userData: {
    email: string;
    phoneNumber: string;
    password: string;
    role: "user";
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
  }): Promise<{ message: string; pendingUserId: string }> {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new AppError("User already exists", 400); // Use AppError for user already exists
    }

    const existingPendingUser = await PendingUser.find({
      email: userData.email,
    });
    if (existingPendingUser.length > 0) {
      await PendingUser.deleteMany({ email: userData.email });
      console.log(`Deleted duplicate pending signups for ${userData.email}`);
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const pendingUser = new PendingUser({
      ...userData,
      password: hashedPassword,
      otp,
      otpExpires,
      dateOfBirth: userData.dateOfBirth
        ? new Date(userData.dateOfBirth)
        : undefined,
    });

    await pendingUser.save();
    await sendOTP(userData.email, otp);
    console.log(`The OTP for ${userData.email} is ${otp}`);

    return {
      message: "OTP sent for verification",
      pendingUserId: pendingUser.id,
    };
  }

  async verifyOTPAndCreateUser(
    pendingUserId: string,
    otp: string,
    res: Response
  ): Promise<IUser> {
    const pendingUser = await PendingUser.findById(pendingUserId);
    if (!pendingUser) {
      throw new AppError("Invalid or expired signup request", 400); // Use AppError for invalid signup request
    }

    if (pendingUser.otp !== otp) {
      throw new AppError("Invalid OTP", 400); // Use AppError for invalid OTP
    }

    if (pendingUser.otpExpires < new Date()) {
      throw new AppError("OTP has expired", 400); // Use AppError for expired OTP
    }

    const phoneNumber = pendingUser.phoneNumber || undefined;

    const newUser = new User({
      email: pendingUser.email,
      phoneNumber: phoneNumber,
      password: pendingUser.password,
      role: "user",
      first_name: pendingUser.firstName,
      last_name: pendingUser.lastName,
      date_of_birth: pendingUser.dateOfBirth,
      created_at: new Date(),
      wallets: [],
      days_active: 0,
    });

    await newUser.save();
    await PendingUser.deleteOne({ _id: pendingUserId });

    const token = generateToken(newUser.id, newUser.role);

    res.cookie("user", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
    });

    return newUser;
  }

  async signIn(
    email: string,
    password: string,
    res: Response,
    req: Request
  ): Promise<{ user: IUser; token: string }> {
    const user = await User.findOne({ email });

    if (!user) {
      throw new AppError("Email not registered", 404); // Use AppError for unregistered email
    }

    if (user.role !== "user") {
      throw new AppError("User is not authorized as a user", 403);
    }

    if (user.status === "blocked") {
      throw new AppError("User is blocked", 403);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError("Incorrect password", 401);
    }

    const token = generateToken(user.id, user.role);

    res.cookie("user", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
    });

    return { user, token };
  }

  async sendOTPForForgotPassword(email: string, res: Response): Promise<void> {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError("Email not registered", 404);
    }

    if (user.role !== "user") {
      throw new AppError("User is not authorized as a user", 403);
    }

    if (user.status === "blocked") {
      throw new AppError("User is blocked or inactive", 403);
    }

    const otp = generateOTP();
    console.log(`the Forgot OTP is ${otp}`);

    res.cookie("resetOTP", otp, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 10 * 60 * 1000,
      sameSite: "strict",
    });

    await sendOTP(user.email, otp);
  }

  async verifyOTPAndSignIn(
    email: string,
    otp: string,
    res: Response,
    req: Request
  ): Promise<{ user: IUser; token: string }> {
    const user = await User.findOne({ email });

    if (!user) {
      throw new AppError("Email not registered", 404);
    }

    if (user.role !== "user") {
      throw new AppError("User is not authorized as a user", 403);
    }

    if (user.status === "blocked") {
      throw new AppError("User is blocked", 403);
    }

    const storedOTP = req.cookies.resetOTP;

    if (!storedOTP) {
      console.log("OTP not found in cookies");
      throw new AppError("No OTP found", 400);
    }

    if (otp !== storedOTP) {
      console.log("OTP mismatch. Provided:", otp, "Stored:", storedOTP);
      throw new AppError("Invalid OTP", 400);
    }

    res.clearCookie("resetOTP");

    const token = generateToken(user.id, user.role);
    res.cookie("user", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
    });
    return { user, token };
  }

  async Logout(res: Response, req: Request): Promise<void> {
    res.clearCookie("user", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
  }
  async getProfile(userId: string): Promise<any> {
    const user = await User.findById(userId).select("-password"); // Exclude sensitive fields

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.role !== "user") {
      throw new AppError("User is not authorized as a user", 401);
    }

    if (user.status === "blocked") {
      throw new AppError("User is blocked", 403);
    }

    return {
      id: user.id,
      number: user.phoneNumber,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
    };
  }

  async editProfile(
    userId: string,
    updates: {
      firstName?: string;
      lastName?: string;
    }
  ): Promise<IUser> {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.role !== "user") {
      throw new AppError("User is not authorized as a user", 401);
    }

    if (user.status === "blocked") {
      throw new AppError("User is blocked", 403);
    }

    if (updates.firstName && updates.firstName.trim().length === 0) {
      throw new AppError("First name cannot be empty", 400);
    }

    if (updates.lastName && updates.lastName.trim().length === 0) {
      throw new AppError("Last name cannot be empty", 400);
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
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.role !== "user") {
      throw new AppError("User is not authorized as a user", 401);
    }

    if (user.status === "blocked") {
      throw new AppError("User is blocked", 403);
    }

    if (updates.oldPassword && updates.newPassword) {
      const isMatch = await bcrypt.compare(updates.oldPassword, user.password);

      if (!isMatch) {
        throw new AppError("Old password is incorrect", 400);
      }

      const isSamePassword = await bcrypt.compare(
        updates.newPassword,
        user.password
      );

      if (isSamePassword) {
        throw new AppError(
          "New password cannot be the same as the old password",
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
    sortBy: string = "createdAt",
    order: "asc" | "desc" = "desc"
  ): Promise<{
    surveys: ISurvey[];
    currentPage: number;
    totalPages: number;
    totalSurveys: number;
  }> {
    const skip = (page - 1) * limit;
    const sortOrder = order === "asc" ? 1 : -1;

    const currentDate = new Date();

    const [surveys, totalSurveys] = await Promise.all([
      Survey.find({
        status: "active",
        "duration.startDate": { $lte: currentDate },
        "duration.endDate": { $gte: currentDate },
      })
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit),
      Survey.countDocuments({
        status: "active",
        "duration.startDate": { $lte: currentDate },
        "duration.endDate": { $gte: currentDate },
      }),
    ]);

    if (surveys.length === 0) {
      throw new AppError("No active surveys found", 404);
    }

    return {
      surveys,
      currentPage: page,
      totalPages: Math.ceil(totalSurveys / limit),
      totalSurveys,
    };
  }

  async getSurveyinfo(surveyId: string): Promise<{
    survey: ISurvey | null;
  }> {
    const survey = await Survey.findOne({
      _id: surveyId,
      status: "active",
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
    // Validate survey exists and is active
    const survey = (await Survey.findById(surveyId)) as ISurvey | null;
    if (!survey) {
      throw new AppError("Survey not found", 404);
    }

    if (survey.status !== "active") {
      throw new AppError("Survey is not active", 400);
    }

    const currentDate = new Date();
    if (
      currentDate < survey.duration.startDate ||
      currentDate > survey.duration.endDate
    ) {
      throw new AppError("Survey is not within its active duration", 400);
    }

    // Check if user has already submitted a response
    const existingResponse = await SurveyResponse.findOne({
      survey: new Types.ObjectId(surveyId),
      user: new Types.ObjectId(userId),
    });

    if (existingResponse) {
      throw new AppError(
        "You have already submitted a response to this survey",
        400
      );
    }

    // Validate all required questions are answered
    const requiredQuestionIds = survey.questions
      .filter((q) => q.required)
      .map((q) => q._id.toString());

    const answeredQuestionIds = responses.map((r) => r.questionId);
    const missingRequiredQuestions = requiredQuestionIds.filter(
      (qId) => !answeredQuestionIds.includes(qId)
    );

    if (missingRequiredQuestions.length > 0) {
      throw new AppError("All required questions must be answered", 400);
    }

    const formattedAnswers = await Promise.all(
      responses.map(async (response) => {
        const question = survey.questions.find(
          (q) => q._id.toString() === response.questionId
        );

        if (!question) {
          throw new AppError(
            `Invalid question ID: ${response.questionId}`,
            400
          );
        }

        let formattedAnswer: {
          questionText: string;
          selectedOptions?: Types.ObjectId[];
          textAnswer?: string;
          ratingValue?: number;
        } = {
          questionText: question.questionText,
        };

        switch (question.questionType) {
          case "single_choice":
          case "rating":
            if (Array.isArray(response.answer)) {
              throw new AppError(
                `Question ${response.questionId} requires a single answer`,
                400
              );
            }
            if (question.questionType === "single_choice") {
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

          case "multiple_choice":
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

          case "text":
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

    // Create survey response
    const surveyResponse = new SurveyResponse({
      survey: surveyId,
      user: userId,
      answers: formattedAnswers,
      completedAt: new Date(),
    });

    await surveyResponse.save();

    await Survey.findByIdAndUpdate(surveyId, {
      $inc: { totalResponses: 1 },
    });

    return surveyResponse;
  }
}

export const userService = new UserService();
