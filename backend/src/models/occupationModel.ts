import { Schema, model } from 'mongoose';
import { IOccupation } from '../interfaces/common.interface';

const categorySchema = new Schema<IOccupation>({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, required: true, trim: true },
  status: { type: Boolean, default: true },
});

const Occupation = model<IOccupation>('Occupation', categorySchema);

export default Occupation;
