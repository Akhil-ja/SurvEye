import { ISurvey, Survey } from '../models/surveyModel';
import { AppError } from '../utils/AppError';
import { ISurveyRepository } from '../interfaces/IRepositoryInterface/ISurveyRepository';

export class SurveyRepository implements ISurveyRepository {
  async findSurveyById(surveyId: string): Promise<ISurvey> {
    const survey = await Survey.findById(surveyId)
      .populate('categories')
      .populate('occupations');

    if (!survey) {
      throw new AppError('Survey not found', 404);
    }

    return survey;
  }

  async getAllSurveys(): Promise<ISurvey[]> {
    const surveys = await Survey.find();

    if (!surveys || surveys.length === 0) {
      throw new AppError('No Surveys found', 404);
    }

    return surveys;
  }

  async findCreatorSurveys(creatorId: string): Promise<ISurvey[]> {
    const surveys = await Survey.find({
      creator: creatorId,
      questions: { $exists: true, $ne: [] },
    })
      .sort({ created_at: -1 })
      .populate('categories', 'name');

    if (!surveys || surveys.length === 0) {
      throw new AppError('No surveys found for this creator', 404);
    }

    return surveys;
  }

  async saveSurvey(surveyData: ISurvey): Promise<ISurvey> {
    const survey = new Survey(surveyData);
    return await survey.save();
  }

  async findSurveys(
    query: any,
    sortCriteria: any,
    skip: number,
    limit: number
  ): Promise<{ surveys: ISurvey[]; totalSurveys: number }> {
    const surveys = (await Survey.find(query)
      .populate('categories', 'name')
      .populate('occupations', 'name')
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit)
      .lean()) as ISurvey[];

    const totalSurveys = await Survey.countDocuments(query);

    return { surveys, totalSurveys };
  }

  async findActiveSurveyById(surveyId: string): Promise<ISurvey> {
    const survey = await Survey.findOne({
      _id: surveyId,
      status: 'active',
    });

    if (!survey) {
      throw new AppError('Active survey not found', 404);
    }

    return survey;
  }

  async findSurveyByIdLean(surveyId: string): Promise<ISurvey | null> {
    const survey = (await Survey.findById(surveyId)) as ISurvey | null;
    return survey;
  }

  async incrementSurveyResponses(surveyId: string): Promise<void> {
    await Survey.findByIdAndUpdate(surveyId, {
      $inc: { totalResponses: 1 },
    });
  }

  async completeSurvey(surveyId: string): Promise<void> {
    await Survey.findByIdAndUpdate(surveyId, {
      status: 'completed',
    });
  }
}
