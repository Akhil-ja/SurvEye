import { Types } from 'mongoose';
import Wallet from '../models/walletModel';
import { IWallet } from '../interfaces/common.interface';
import { IWalletRepository } from '../interfaces/IRepositoryInterface/IWalletRepository';

export class WalletRepository implements IWalletRepository {
  async createWallet(data: {
    userId: string;
    publicAddress?: string;
    encryptedPrivateKey?: string;
    network: string;
  }): Promise<IWallet> {
    const newWallet = new Wallet({
      userId: new Types.ObjectId(data.userId),
      publicAddress: data.publicAddress,
      encryptedPrivateKey: data.encryptedPrivateKey,
      network: data.network || 'devnet',
    });

    return await newWallet.save();
  }

  async findWalletByUserAndAddress(
    userId: string,
    publicAddress: string
  ): Promise<IWallet | null> {
    return Wallet.findOne({
      userId: new Types.ObjectId(userId),
      publicAddress,
    });
  }

  async findWalletByUser(userId: string): Promise<IWallet | null> {
    return Wallet.findOne({ userId: new Types.ObjectId(userId) });
  }

  async incrementPayout(walletId: string, payoutAmount: number): Promise<void> {
    await Wallet.findByIdAndUpdate(new Types.ObjectId(walletId), {
      $inc: { payout: payoutAmount },
    });
  }

  async lockPayout(walletId: string): Promise<IWallet | null> {
    return Wallet.findOneAndUpdate(
      { _id: new Types.ObjectId(walletId), isPayoutLocked: false },
      { isPayoutLocked: true },
      { new: true }
    );
  }

  async unlockPayout(walletId: string): Promise<void> {
    await Wallet.findByIdAndUpdate(new Types.ObjectId(walletId), {
      isPayoutLocked: false,
    });
  }
}

export const walletRepository = new WalletRepository();
