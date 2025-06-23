import { Schema, model } from 'mongoose';
import { ICategory } from '../interfaces/common.interface';
import mapper from '../utils/mapping';

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true, trim: true },
    status: { type: Boolean, default: true },
  },
  mapper
);

const Category = model<ICategory>('Category', categorySchema);

export default Category;
