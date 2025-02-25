import { ISurveyResponse } from '../common.interface';

export interface ISurveyResponseRepository {
  findResponsesBySurveyId(surveyId: string): Promise<ISurveyResponse[]>;
  findExistingResponse(
    surveyId: string,
    userId: string
  ): Promise<ISurveyResponse | null>;
  findAttendedSurveys(userId: string): Promise<any>;
  createSurveyResponse(
    data: Partial<ISurveyResponse>
  ): Promise<ISurveyResponse>;
}
