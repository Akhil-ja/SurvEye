import { IUser, IPendingUser } from '../common.interface';

export interface IUserRepository {
  // User operations
  getAllUsers(): Promise<IUser[]>;
  findByEmail(email: string): Promise<IUser | null>;
  findById(userId: string): Promise<IUser | null>;
  findByPhone(phoneNumber: string): Promise<IUser | null>;
  findByIdExcludingPassword(userId: string): Promise<IUser | null>;
  createUser(userData: Partial<IUser>): Promise<IUser>;
  findUserWithWallet(userId: string): Promise<IUser | null>;
  findUserWithWalletWithoutLean(userId: string): Promise<IUser | null>;
  findUserWithOccupation(userId: string): Promise<IUser | null>;

  // Pending user operations
  findPendingUserById(pendingUserId: string): Promise<IPendingUser | null>;
  findPendingUsersByEmail(email: string): Promise<IPendingUser[]>;
  deletePendingUsersByEmail(email: string): Promise<void>;
  findPendingUsersByPhone(phoneNumber: string): Promise<IPendingUser[]>;
  deletePendingUsersByPhone(phoneNumber: string): Promise<void>;
  createPendingUser(userData: Partial<IPendingUser>): Promise<IPendingUser>;
  deletePendingUserById(pendingUserId: string): Promise<void>;
}
