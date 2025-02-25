import { generateOTP, sendOTP } from '../utils/otpUtils';
import { Response, Request } from 'express';
import { generateTokens } from '../utils/jwtUtils';
import bcrypt from 'bcryptjs';
import { ITransaction, IUser } from '../interfaces/common.interface';
import { AppError } from '../utils/AppError';
import { generatePassword, sendPassword } from '../utils/passwordUtil';
import * as web3 from '@solana/web3.js';
import { Types } from 'mongoose';
import bs58 from 'bs58';
import { IWallet, AuthResponse } from '../interfaces/common.interface';
import { ISharedServices } from '../interfaces/IServiceInterface/ISharedServices';
import { ISurveyRepository } from '../interfaces/IRepositoryInterface/ISurveyRepository';
import { ITransactionRepository } from '../interfaces/IRepositoryInterface/ITransactionRepository';
import { userRepository } from '../repositories/userRepository';
import { IUserRepository } from '../interfaces/IRepositoryInterface/IUserRepository';
import { IWalletRepository } from '../interfaces/IRepositoryInterface/IWalletRepository';

export class SharedService implements ISharedServices {
  constructor(
    private readonly surveyRepository: ISurveyRepository,
    private readonly transationRepository: ITransactionRepository,
    private readonly userRepository: IUserRepository,
    private readonly walletRepository: IWalletRepository
  ) {}

  async resendOTP(
    pendingUserId: string
  ): Promise<{ message: string; otp: string }> {
    const pendingUser =
      await this.userRepository.findPendingUserById(pendingUserId);
    if (!pendingUser) {
      throw new AppError('Pending user not found', 404);
    }

    const newOtp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    pendingUser.otp = newOtp;
    pendingUser.otpExpires = otpExpires;

    await pendingUser.save();
    await sendOTP(pendingUser.email, newOtp);

    return {
      message: 'New OTP sent for verification',
      otp: newOtp,
    };
  }

  // Logout user
  async logout(res: Response): Promise<void> {
    console.log('Logging out...');

    res.clearCookie('user_accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.clearCookie('user_refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
  }

  // Send OTP for password reset
  async sendForgotPasswordOTP(
    email: string,
    res: Response
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Email not registered', 404);
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const hashedOTP = await bcrypt.hash(otp, 10);

    res.cookie('resetOTP', hashedOTP, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 60 * 1000,
      sameSite: 'strict',
    });

    await sendOTP(email, otp);
    console.log(`The forgot password OTP is ${otp}`);
    return {
      message: `OTP sent for password reset`,
    };
  }

  // Resend OTP for password reset
  async resendForgotPasswordOTP(
    email: string,
    res: Response
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Email not registered', 404);
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const hashedOTP = await bcrypt.hash(otp, 10);

    res.cookie('resetOTP', hashedOTP, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 60 * 1000,
      sameSite: 'strict',
    });

    await sendOTP(email, otp);
    console.log(`The forgot password OTP is ${otp}`);

    return {
      message: `A new OTP has been sent for password reset`,
    };
  }

  async verifyForgotPasswordOTP(
    email: string,
    otp: string,
    req: Request,
    res: Response
  ): Promise<AuthResponse> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Email not registered', 404);
    }

    const storedHashedOTP = req.cookies.resetOTP;
    if (!storedHashedOTP) {
      throw new AppError('No OTP found', 400);
    }

    const isMatch = await bcrypt.compare(otp, storedHashedOTP);
    if (!isMatch) {
      throw new AppError('Invalid OTP', 400);
    }

    res.clearCookie('resetOTP');

    const tokens = generateTokens(user.id, user.role);

    res.cookie('user_accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000,
      sameSite: 'strict',
    });

    res.cookie('user_refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'strict',
    });

    return {
      user,
      tokens,
    };
  }

  async googleAuth({
    email,
    displayName,
    role = 'user',
    res,
  }: {
    email: string;
    displayName: string;
    role?: string;
    res: Response;
  }): Promise<AuthResponse> {
    let user = await this.userRepository.findByEmail(email);

    if (!user) {
      const password = generatePassword();
      const hashedPassword = await bcrypt.hash(password, 10);
      const [first_name, ...last_nameParts] = displayName.split(' ');
      const last_name = last_nameParts.join(' ');

      user = await userRepository.createUser({
        email,
        role,
        first_name,
        last_name,
        password: hashedPassword,
        wallets: [],
        days_active: 0,
      });

      await sendPassword(email, password);
    }

    const tokens = generateTokens(user.id, user.role);

    res.cookie('user_accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000,
      sameSite: 'strict',
    });

    res.cookie('user_refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'strict',
    });

    return { user, tokens };
  }

  async createWallet(userId: string): Promise<IWallet> {
    const connection = new web3.Connection(
      web3.clusterApiUrl('devnet'),
      'confirmed'
    );

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const wallet = web3.Keypair.generate();

    const encryptedPrivateKey = await bcrypt.hash(
      wallet.secretKey.toString(),
      10
    );

    const newWallet = await this.walletRepository.createWallet({
      userId,
      publicAddress: wallet.publicKey.toBase58(),
      encryptedPrivateKey,
      network: 'devnet',
    });

    user.wallet = newWallet._id;
    await user.save();

    return newWallet;
  }

  async addExistingWallet(
    userId: string,
    publicAddress: string,
    privateKey: string
  ): Promise<IWallet> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const existingWallet =
      await this.walletRepository.findWalletByUserAndAddress(
        publicAddress,
        userId
      );
    if (existingWallet) {
      throw new Error('Wallet with this address already exists for the user');
    }

    const privateKeyBytes = bs58.decode(privateKey);

    const keypair = web3.Keypair.fromSecretKey(privateKeyBytes);

    const derivedPublicKey = keypair.publicKey.toBase58();
    if (derivedPublicKey !== publicAddress) {
      throw new Error('Invalid private key for the given public address');
    }

    const encryptedPrivateKey = await bcrypt.hash(privateKey, 10);

    const newWallet = await this.walletRepository.createWallet({
      userId,
      publicAddress,
      encryptedPrivateKey,
      network: 'devnet',
    });

    user.wallet = newWallet._id as Types.ObjectId;
    await user.save();

    return newWallet;
  }

  async getWallet(userId: string): Promise<IWallet | null> {
    const user = await userRepository.findUserWithWallet(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.wallet) {
      return null;
    }

    return user.wallet;
  }

  async getTransactions(userId: string): Promise<ITransaction[] | null> {
    const transactions =
      await this.transationRepository.getTransactionsByUser(userId);
    if (!transactions) {
      throw new AppError('transactions not found', 404);
    }

    return transactions;
  }

  async makeTransaction(
    userId: string,
    amount: number,
    type: string,
    status: string,
    sender: string,
    recipient: string,
    signature: string
  ): Promise<ITransaction> {
    if (!userId || !amount || !type || !status) {
      throw new AppError('Invalid transaction details', 404);
    }

    const savedTransaction = await this.transationRepository.makeTransaction({
      user: userId,
      amount,
      type,
      status,
      sender: sender,
      recipient: recipient,
      signature: signature,
    });

    return savedTransaction;
  }
}
