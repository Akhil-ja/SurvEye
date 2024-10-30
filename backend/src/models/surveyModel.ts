// Survey.ts
import { Schema, model, Document, Types } from "mongoose";

interface IOption extends Document {
  text: string;
  value: number;
}

interface IQuestion {
  _id: Types.ObjectId;
  questionText: string;
  questionType: "multiple_choice" | "single_choice" | "text" | "rating";
  options: IOption[];
  required: boolean;
  pageNumber: number;
}

interface ITargetAgeRange {
  isAllAges: boolean;
  minAge?: number;
  maxAge?: number;
}

interface IDuration {
  startDate: Date;
  endDate: Date;
}

interface ISurvey extends Document {
  creator: Types.ObjectId;
  surveyName: string;
  description: string;
  category: "market" | "product" | "customer";
  creatorName: string;
  sampleSize: number;
  targetAgeRange: ITargetAgeRange;
  duration: IDuration;
  status: "draft" | "active" | "completed" | "cancelled";
  questions: IQuestion[];
  created_at: Date;
  updated_at: Date;
  totalResponses: number;
  isPublished: boolean;
}

const optionSchema = new Schema<IOption>({
  text: { type: String, required: true },
  value: { type: Number, required: true },
});

const questionSchema = new Schema<IQuestion>({
  questionText: { type: String, required: true },
  questionType: {
    type: String,
    enum: ["multiple_choice", "single_choice", "text", "rating"],
    required: true,
  },
  options: [optionSchema],
  required: { type: Boolean, default: true },
  pageNumber: { type: Number, required: true },
});

const surveySchema = new Schema<ISurvey>({
  creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
  surveyName: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ["market", "product", "customer"],
    required: true,
  },
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
    enum: ["draft", "active", "completed", "cancelled"],
    default: "draft",
  },
  questions: [questionSchema],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  totalResponses: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: false },
});

// Middleware to update `updated_at` field
surveySchema.pre("save", function (next) {
  this.updated_at = new Date();
  next();
});

const Survey = model<ISurvey>("Survey", surveySchema);

export { Survey, ISurvey };
