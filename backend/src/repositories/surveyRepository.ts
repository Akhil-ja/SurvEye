import { Model } from "mongoose";
import { ISurvey } from "../models/surveyModel";

export class SurveyRepository {
  constructor(private readonly surveyModel: Model<ISurvey>) {}

  async create(surveyData: Partial<ISurvey>): Promise<ISurvey> {
    const survey = new this.surveyModel(surveyData);
    return await survey.save();
  }

  async findById(id: string): Promise<ISurvey | null> {
    return await this.surveyModel.findById(id);
  }

  async findAll(filter: Partial<ISurvey> = {}): Promise<ISurvey[]> {
    return await this.surveyModel.find();
  }

  async update(
    id: string,
    surveyData: Partial<ISurvey>
  ): Promise<ISurvey | null> {
    return await this.surveyModel.findByIdAndUpdate(
      id,
      { $set: surveyData },
      { new: true }
    );
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.surveyModel.findByIdAndDelete(id);
    return result !== null;
  }

  async findByCreator(creatorId: string): Promise<ISurvey[]> {
    return await this.surveyModel.find({ creator: creatorId });
  }

  async updateStatus(
    id: string,
    status: ISurvey["status"]
  ): Promise<ISurvey | null> {
    return await this.surveyModel.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    );
  }
}
