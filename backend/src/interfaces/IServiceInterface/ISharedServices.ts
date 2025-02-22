import { Response, Request } from 'express';
import { AuthResponse, ITransaction, IWallet } from '../common.interface';

export interface ISharedServices {
  resendOTP(pendingUserId: string): Promise<{ message: string; otp: string }>;
  logout(res: Response): Promise<void>;
  sendForgotPasswordOTP(
    email: string,
    res: Response
  ): Promise<{ message: string }>;
  resendForgotPasswordOTP(
    email: string,
    res: Response
  ): Promise<{ message: string }>;

  verifyForgotPasswordOTP(
    email: string,
    otp: string,
    req: Request,
    res: Response
  ): Promise<AuthResponse>;
  googleAuth({
    email,
    displayName,
    role,
    res,
  }: {
    email: string;
    displayName: string;
    role?: string;
    res: Response;
  }): Promise<AuthResponse>;

  createWallet(userId: string): Promise<IWallet>;
  addExistingWallet(
    userId: string,
    publicAddress: string,
    privateKey: string
  ): Promise<IWallet>;
  getWallet(userId: string): Promise<IWallet | null>;
  getTransactions(userId: string): Promise<ITransaction[] | null>;
  makeTransaction(
    userId: string,
    amount: number,
    type: string,
    status: string,
    sender: string,
    recipient: string,
    signature: string
  ): Promise<ITransaction>;
}
