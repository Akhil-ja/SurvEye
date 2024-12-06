import { generateOTP, sendOTP } from '../utils/otpUtils';
import PendingUser from '../models/pendingUserModel';
import User from '../models/usersModel';
import { Response, Request } from 'express';
import { generateTokens } from '../utils/jwtUtils';
import bcrypt from 'bcryptjs';
import { IUser } from '../interfaces/common.interface';
import { AppError } from '../utils/AppError';
import { generatePassword, sendPassword } from '../utils/passwordUtil';
import * as web3 from '@solana/web3.js';
import Wallet from '../models/walletModel';
import bs58 from 'bs58';
import { IWallet } from '../interfaces/common.interface';
interface AuthResponse {
  user: IUser;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}
export class SharedService {
  async resendOTP(
    pendingUserId: string
  ): Promise<{ message: string; otp: string }> {
    const pendingUser = await PendingUser.findById(pendingUserId);
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
    const user = await User.findOne({ email });
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
    const user = await User.findOne({ email });
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

  // Verify OTP for password reset
  async verifyForgotPasswordOTP(
    email: string,
    otp: string,
    req: Request,
    res: Response
  ): Promise<AuthResponse> {
    const user = await User.findOne({ email });
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
    let user = await User.findOne({ email: email });

    if (!user) {
      const password = generatePassword();
      const hashedPassword = await bcrypt.hash(password, 10);
      const [first_name, ...last_nameParts] = displayName.split(' ');
      const last_name = last_nameParts.join(' ');

      user = new User({
        email,
        role,
        first_name,
        last_name,
        password: hashedPassword,
        wallets: [],
        days_active: 0,
      });

      await user.save();
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

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const wallet = web3.Keypair.generate();

    const encryptedPrivateKey = await bcrypt.hash(
      wallet.secretKey.toString(),
      10
    );

    const newWallet = new Wallet({
      userId,
      publicAddress: wallet.publicKey.toBase58(),
      encryptedPrivateKey,
      network: 'devnet',
    });

    const savedWallet = await newWallet.save();

    user.wallet = savedWallet._id;
    await user.save();

    return savedWallet;
  }

  async addExistingWallet(
    userId: string,
    publicAddress: string,
    privateKey: string
  ): Promise<IWallet> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const existingWallet = await Wallet.findOne({
      publicAddress,
      userId,
    });
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

    const newWallet = new Wallet({
      userId,
      publicAddress,
      encryptedPrivateKey,
      network: 'devnet',
    });

    const savedWallet = await newWallet.save();

    user.wallet = savedWallet._id;
    await user.save();

    return savedWallet;
  }

  async getWallet(userId: string): Promise<IWallet | null> {
    const user = await User.findById(userId)
      .populate<{ wallet: IWallet }>('wallet')
      .lean()
      .exec();

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.wallet) {
      return null;
    }

    return user.wallet;
  }
}
