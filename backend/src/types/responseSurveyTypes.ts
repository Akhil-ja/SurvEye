// types/survey.ts
import { Document, Types } from "mongoose";

export interface IOption extends Document {
  text: string;
  value: number;
  _id: Types.ObjectId;
}

export interface IQuestion extends Document {
  _id: Types.ObjectId;
  questionText: string;
  questionType: "single_choice" | "multiple_choice" | "rating" | "text";
  required: boolean;
  options: IOption[];
}

export interface ISurvey extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  questions: IQuestion[];
  status: "draft" | "active" | "closed";
  duration: {
    startDate: Date;
    endDate: Date;
  };
  totalResponses: number;
}

export interface ResponseData {
  questionId: string;
  answer: string | string[];
}
