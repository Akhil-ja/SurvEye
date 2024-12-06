import { Schema, model } from 'mongoose';
import { IUser } from '../interfaces/common.interface';

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'creator'], required: true },
  created_at: { type: Date, default: Date.now },
  edited_at: { type: Date, default: Date.now },
  first_name: {
    type: String,
    required: function () {
      return this.role === 'user';
    },
  },
  last_name: {
    type: String,
    required: function () {
      return this.role === 'user';
    },
  },
  creator_name: { type: String, unique: true, sparse: true },
  industry: { type: String },
  wallet: { type: Schema.Types.ObjectId, ref: 'Wallet' },
  date_of_birth: { type: Date },
  days_active: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['active', 'blocked'],
    default: 'active',
  },
  occupation: {
    type: Schema.Types.ObjectId,
    ref: 'Occupation',
  },
});

const User = model<IUser>('User', userSchema);

export default User;
