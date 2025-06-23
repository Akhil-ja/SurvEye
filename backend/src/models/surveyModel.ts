import { Schema, model } from 'mongoose';
import { IOption, IQuestion, ISurvey } from '../interfaces/common.interface';
import mapper from '../utils/mapping';

const optionSchema = new Schema<IOption>({
  text: { type: String, required: true },
  value: { type: Number, required: true },
});

const questionSchema = new Schema<IQuestion>({
  questionText: { type: String, required: true },
  questionType: {
    type: String,
    enum: ['multiple_choice', 'single_choice', 'text', 'rating'],
    required: true,
  },
  options: [optionSchema],
  required: { type: Boolean, default: true },
  pageNumber: { type: Number, required: true },
});

const surveySchema = new Schema<ISurvey>(
  {
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    surveyName: { type: String, required: true },
    description: { type: String, required: true },

    price: { type: Number },
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
      },
    ],

    occupations: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Occupation',
      },
    ],
    isAllOccupations: { type: Boolean, default: false },

    creatorName: { type: String, required: true },
    sampleSize: { type: Number, required: true },
    targetAgeRange: {
      isAllAges: { type: Boolean, default: false },
      minAge: { type: Number },
      maxAge: { type: Number },
    },
    duration: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'completed', 'cancelled'],
      default: 'draft',
    },
    questions: [questionSchema],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    totalResponses: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
  },
  mapper
);

surveySchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

const Survey = model<ISurvey>('Survey', surveySchema);

export { Survey, ISurvey };
