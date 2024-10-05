import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  phoneNumber: string;
  password: string;
  role: "user" | "creator";
  created_at: Date;
  edited_at: Date;
  first_name?: string;
  last_name?: string;
  creator_name?: string;
  industry?: string;
  wallets: number[];
  date_of_birth?: Date;
  days_active: number;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "creator"], required: true },
  created_at: { type: Date, default: Date.now },
  edited_at: { type: Date, default: Date.now },
  first_name: {
    type: String,
    required: function () {
      return this.role === "user";
    },
  },
  last_name: {
    type: String,
    required: function () {
      return this.role === "user";
    },
  },
  creator_name: { type: String, unique: true, sparse: true },
  industry: { type: String },
  wallets: { type: [Number], default: [] },
  date_of_birth: {
    type: Date,
    required: function () {
      return this.role === "user";
    },
  },
  days_active: { type: Number, default: 0 },
});

const User = model<IUser>("User", userSchema);

export default User;
