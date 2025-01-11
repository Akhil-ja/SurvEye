import mongoose from 'mongoose';
import { model } from 'mongoose';
import { IWallet } from '../interfaces/common.interface';

const WalletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  publicAddress: { type: String, unique: true },
  encryptedPrivateKey: { type: String },
  isActive: { type: Boolean, default: true },
  network: {
    type: String,
    enum: ['devnet', 'testnet', 'mainnet'],
    default: 'devnet',
  },
  payout: { type: Number, default: 0.000000000001 },
  isPayoutLocked: { type: Boolean, default: false },
});

const Wallet = model<IWallet>('Wallet', WalletSchema);

export default Wallet;
