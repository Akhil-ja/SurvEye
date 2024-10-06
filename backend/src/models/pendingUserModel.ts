import mongoose, { Schema, Document } from "mongoose";

export interface IPendingUser extends Document {
  email: string;
  phoneNumber: string;
  password: string;
  role: "user" | "creator";
  firstName?: string;
  lastName?: string;
  creatorName?: string;
  industry?: string;
  dateOfBirth?: Date;
  otp: string;
  otpExpires: Date;
}

const pendingUserSchema = new Schema<IPendingUser>({
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "creator"], required: true },
  firstName: String,
  lastName: String,
  creatorName: String,
  industry: String,
  dateOfBirth: Date,
  otp: { type: String, required: true },
  otpExpires: { type: Date, required: true, expires: 0 }, // This sets up the TTL index
});

const PendingUser = mongoose.model<IPendingUser>(
  "PendingUser",
  pendingUserSchema
);

export default PendingUser;
