import { Types } from 'mongoose';
import { SurveyResponse } from '../models/surveyresponse';
import { ISurveyResponse } from '../interfaces/common.interface';
import { ISurveyResponseRepository } from '../interfaces/IRepositoryInterface/ISurveyResponseRepository';

export class SurveyResponseRepository implements ISurveyResponseRepository {
  async findResponsesBySurveyId(surveyId: string): Promise<ISurveyResponse[]> {
    return await SurveyResponse.find({ survey: surveyId });
  }

  async findExistingResponse(
    surveyId: string,
    userId: string
  ): Promise<ISurveyResponse | null> {
    return await SurveyResponse.findOne({
      survey: new Types.ObjectId(surveyId),
      user: new Types.ObjectId(userId),
    });
  }

  async findAttendedSurveys(userId: string): Promise<any> {
    return await SurveyResponse.find({ user: userId }, 'survey').lean();
  }

  async createSurveyResponse(
    data: Partial<ISurveyResponse>
  ): Promise<ISurveyResponse> {
    const surveyResponse = new SurveyResponse({
      survey: data.survey,
      user: data.user,
      answers: data.answers,
      completedAt: new Date(),
    });

    return await surveyResponse.save();
  }
}

export const surveyResponseRepository = new SurveyResponseRepository();
