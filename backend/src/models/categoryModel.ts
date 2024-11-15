import { Schema, model } from 'mongoose';
import { ICategory } from '../interfaces/common.interface';

const categorySchema = new Schema<ICategory>({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, required: true, trim: true },
  status: { type: Boolean, default: true },
});

const Category = model<ICategory>('Category', categorySchema);

export default Category;
