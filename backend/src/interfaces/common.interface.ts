import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  email: string;
  phoneNumber: string;
  password: string;
  role: 'user' | 'creator';
  created_at: Date;
  edited_at: Date;
  first_name?: string;
  last_name?: string;
  creator_name?: string;
  industry?: string;
  wallet: Types.ObjectId;
  date_of_birth?: Date;
  days_active: number;
  status: 'active' | 'blocked';
  occupation: Types.ObjectId;
}

export interface IOption extends Document {
  _id: Types.ObjectId;
  text: string;
  value: number;
}

export interface IAnswer {
  questionText: string;
  questionId: Types.ObjectId;
  selectedOptions?: Types.ObjectId[] | IOption[];
  textAnswer?: string;
  ratingValue?: number;
}

export interface ISurveyResponse extends Document {
  survey: Types.ObjectId;
  user: Types.ObjectId;
  answers: IAnswer[];
  completedAt: Date;
}

export interface ITargetAgeRange {
  isAllAges: boolean;
  minAge?: number;
  maxAge?: number;
}

export interface IDuration {
  startDate: Date;
  endDate: Date;
}

export interface ISurvey extends Document {
  _id: Types.ObjectId;
  creator: Types.ObjectId;
  surveyName: string;
  description: string;
  categories: Types.ObjectId[];
  creatorName: string;
  sampleSize: number;
  targetAgeRange: ITargetAgeRange;
  duration: IDuration;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  questions: IQuestion[];
  created_at: Date;
  updated_at: Date;
  totalResponses: number;
  isPublished: boolean;
  price: number;
  occupations: Types.ObjectId[] | null;
  isAllOccupations: boolean;
}

export interface IQuestion {
  _id: Types.ObjectId;
  questionText: string;
  questionType: 'multiple_choice' | 'single_choice' | 'text' | 'rating';
  options: IOption[];
  required: boolean;
  pageNumber: number;
}

export interface ITargetAgeRange {
  isAllAges: boolean;
  minAge?: number;
  maxAge?: number;
}

export interface IDuration {
  startDate: Date;
  endDate: Date;
}

export interface IAdmin extends Document {
  email: string;
  password: string;
  role: 'admin';
  created_at: Date;
  edited_at: Date;
}

export interface ICategory extends Document {
  name: string;
  description: string;
  status: boolean;
}

export interface IPendingUser extends Document {
  email: string;
  phoneNumber: string;
  password: string;
  role: 'user' | 'creator';
  firstName?: string;
  lastName?: string;
  creatorName?: string;
  industry?: string;
  dateOfBirth?: Date;
  otp: string;
  otpExpires: Date;
}

export interface IOccupation extends Document {
  name: string;
  description: string;
  status: boolean;
}

export interface IWallet {
  userId: Types.ObjectId;
  publicAddress: string;
  encryptedPrivateKey: string;
  isActive?: boolean;
  network?: 'devnet' | 'testnet' | 'mainnet';
  payout: number;
  isPayoutLocked: boolean;
}

export interface ITransaction {
  user: Types.ObjectId;
  type: string;
  sender: string;
  recipient: string;
  amount: number;
  signature: string;
  status: string;
}

export interface IAdminCut {
  percentage: number;
  updatedAt: Date;
}

export interface IAnnouncement {
  title: string;
  message: string;
  timestamp: Date;
  type: string;
  target: string;
}

export interface INotification {
  title: string;
  message: string;
  user: Types.ObjectId;
  type: string;
  timestamp: Date;
}
