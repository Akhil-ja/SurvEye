import { ITransaction } from '../interfaces/common.interface';
import { ITransactionRepository } from '../interfaces/IRepositoryInterface/ITransactionRepository';
import Transaction from '../models/transactionModel';
import { AppError } from '../utils/AppError';

export class TransactionRepository implements ITransactionRepository {
  async getAllTransactions(): Promise<ITransaction[]> {
    const transactions = await Transaction.find({});

    if (!transactions || transactions.length === 0) {
      throw new AppError('No transactions found', 404);
    }

    return transactions;
  }

  async getTransactionsByUser(userId: string): Promise<ITransaction[] | null> {
    const transactions = await Transaction.find({ user: userId }).sort({
      createdAt: -1,
    });

    if (!transactions) {
      throw new AppError('Transactions not found', 404);
    }

    return transactions;
  }

  async makeTransaction(data: any): Promise<ITransaction> {
    const { user, amount, type, status, sender, recipient, signature } = data;

    if (!user || !amount || !type || !status) {
      throw new AppError('Invalid transaction details', 400);
    }

    const newTransaction = new Transaction(data);

    return await newTransaction.save();
  }
}
