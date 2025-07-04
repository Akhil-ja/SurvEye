// SurveyResponse.ts
import { Schema, model } from 'mongoose';
import { ISurveyResponse } from '../interfaces/common.interface';
import mapper from '../utils/mapping';

const surveyResponseSchema = new Schema<ISurveyResponse>(
  {
    survey: { type: Schema.Types.ObjectId, ref: 'Survey', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    answers: [
      {
        questionId: { type: Schema.Types.ObjectId, ref: 'Survey.questions' },
        questionText: { type: String, required: true },
        selectedOptions: [{ type: Schema.Types.ObjectId, ref: 'Option' }],
        textAnswer: String,
        ratingValue: Number,
      },
    ],
    completedAt: { type: Date, default: Date.now },
  },
  mapper
);

const SurveyResponse = model<ISurveyResponse>(
  'SurveyResponse',
  surveyResponseSchema
);

export { SurveyResponse, ISurveyResponse };
