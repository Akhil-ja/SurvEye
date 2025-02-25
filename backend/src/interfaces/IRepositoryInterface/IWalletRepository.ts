import { IWallet } from '../common.interface';

export interface IWalletRepository {
  createWallet(data: {
    userId: string;
    publicAddress?: string;
    encryptedPrivateKey?: string;
    network: string;
  }): Promise<IWallet>;
  findWalletByUserAndAddress(
    userId: string,
    publicAddress: string
  ): Promise<IWallet | null>;
  findWalletByUser(userId: string): Promise<IWallet | null>;
  incrementPayout(walletId: string, payoutAmount: number): Promise<void>;
  lockPayout(walletId: string): Promise<IWallet | null>;
  unlockPayout(walletId: string): Promise<void>;
}
