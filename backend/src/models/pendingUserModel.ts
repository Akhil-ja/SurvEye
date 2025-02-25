import mongoose, { Schema, Document } from 'mongoose';
import { IPendingUser } from '../interfaces/common.interface';

const pendingUserSchema = new Schema<IPendingUser>({
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'creator'], required: true },
  firstName: String,
  lastName: String,
  creatorName: String,
  industry: String,
  dateOfBirth: Date,
  otp: { type: String, required: true },
  otpExpires: { type: Date, required: true, expires: 600 },
});

const PendingUser = mongoose.model<IPendingUser>(
  'PendingUser',
  pendingUserSchema
);

export default PendingUser;
