import { ITransaction } from '../common.interface';

export interface ITransactionRepository {
  getAllTransactions(): Promise<ITransaction[]>;
  getTransactionsByUser(userId: string): Promise<ITransaction[] | null>;
  makeTransaction(data: any): Promise<ITransaction>;
}
