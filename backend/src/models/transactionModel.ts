import { Schema, model } from 'mongoose';
import { ITransaction } from '../interfaces/common.interface';

const transactionSchema = new Schema<ITransaction>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    type: {
      type: String,
      required: true,
      enum: ['credit', 'debit', 'payout'],
    },
    sender: { type: String },
    recipient: { type: String },
    amount: { type: Number },
    signature: { type: String },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'completed', 'failed'],
    },
  },
  { timestamps: true }
);

const Transaction = model<ITransaction>('Transaction', transactionSchema);

export default Transaction;
