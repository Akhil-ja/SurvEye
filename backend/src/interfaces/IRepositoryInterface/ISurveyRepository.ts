import { ISurvey } from '../common.interface';

export interface ISurveyRepository {
  getAllSurveys(): Promise<ISurvey[]>;
  findSurveyById(SurveyId: string): Promise<ISurvey>;
  findCreatorSurveys(creatorId: string): Promise<ISurvey[]>;
  saveSurvey(surveyData: ISurvey): Promise<ISurvey>;
}
