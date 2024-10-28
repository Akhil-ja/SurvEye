// SurveyResponse.ts
import { Schema, model, Document, Types } from "mongoose";

interface IOption extends Document {
  text: string;
  value: number;
}

interface IAnswer {
  questionText: string;
  selectedOptions?: IOption[];
  textAnswer?: string;
  ratingValue?: number;
}

interface ISurveyResponse extends Document {
  survey: Types.ObjectId;
  user: Types.ObjectId;
  answers: IAnswer[];
  completedAt: Date;
}

const surveyResponseSchema = new Schema<ISurveyResponse>({
  survey: { type: Schema.Types.ObjectId, ref: "Survey", required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  answers: [
    {
      questionText: { type: String, required: true },
      selectedOptions: [{ type: Schema.Types.ObjectId, ref: "Option" }],
      textAnswer: String,
      ratingValue: Number,
    },
  ],
  completedAt: { type: Date, default: Date.now },
});

const SurveyResponse = model<ISurveyResponse>(
  "SurveyResponse",
  surveyResponseSchema
);

export { SurveyResponse, ISurveyResponse };
