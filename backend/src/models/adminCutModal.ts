import { Schema, model } from 'mongoose';
import { IAdminCut } from '../interfaces/common.interface';
import mapper from '../utils/mapping';

const adminCutSchema = new Schema<IAdminCut>(
  {
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    updatedAt: { type: Date, default: Date.now },
  },
  mapper
);

const AdminCut = model<IAdminCut>('AdminCut', adminCutSchema);

export default AdminCut;
