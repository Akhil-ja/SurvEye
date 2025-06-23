import { Schema, model } from 'mongoose';
import { IAdmin } from '../interfaces/common.interface';
import mapper from '../utils/mapping';

const adminSchema = new Schema<IAdmin>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'admin', immutable: true },
    created_at: { type: Date, default: Date.now },
    edited_at: { type: Date, default: Date.now },
  },
  mapper
);

const Admin = model<IAdmin>('Admin', adminSchema);

export default Admin;
