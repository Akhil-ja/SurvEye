import User from '../models/usersModel';
import PendingUser from '../models/pendingUserModel';
import { IUser, IPendingUser, IWallet } from '../interfaces/common.interface';
import { AppError } from '../utils/AppError';
import { IUserRepository } from '../interfaces/IRepositoryInterface/IUserRepository';

export class UserRepository implements IUserRepository {
  async getAllUsers(): Promise<IUser[]> {
    const users = await User.find();
    if (!users || users.length === 0) {
      throw new AppError('No users found', 404);
    }
    return users;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email });
  }

  async findByPhone(phoneNumber: string): Promise<IUser | null> {
    return User.findOne({ phoneNumber });
  }
  async findById(userId: string): Promise<IUser | null> {
    return User.findById(userId);
  }

  async findByIdExcludingPassword(userId: string): Promise<IUser | null> {
    return User.findById(userId).select('-password');
  }

  async createUser(data: any): Promise<IUser> {
    const user = new User(data);
    return await user.save();
  }

  async findUserWithWallet(userId: string): Promise<any> {
    return User.findById(userId)
      .populate<{ wallet: IWallet }>('wallet')
      .lean()
      .exec();
  }

  async findUserWithWalletWithoutLean(userId: string): Promise<IUser | null> {
    return User.findById(userId).populate('wallet').exec();
  }

  async findUserWithOccupation(userId: string): Promise<IUser | null> {
    return User.findById(userId)
      .select('-password')
      .populate('occupation', 'name');
  }

  /*** PENDING USER OPERATIONS ***/

  async findPendingUsersByEmail(email: string): Promise<IPendingUser[]> {
    return PendingUser.find({ email });
  }

  async deletePendingUsersByEmail(email: string): Promise<void> {
    await PendingUser.deleteMany({ email });
  }

  async findPendingUsersByPhone(phoneNumber: string): Promise<IPendingUser[]> {
    return PendingUser.find({ phoneNumber });
  }

  async deletePendingUsersByPhone(phoneNumber: string): Promise<void> {
    await PendingUser.deleteMany({ phoneNumber });
  }

  async createPendingUser(data: any): Promise<IPendingUser> {
    const pendingUser = new PendingUser(data);

    return await pendingUser.save();
  }

  async findPendingUserById(
    pendingUserId: string
  ): Promise<IPendingUser | null> {
    return PendingUser.findById(pendingUserId);
  }

  async deletePendingUserById(pendingUserId: string): Promise<void> {
    await PendingUser.deleteOne({ _id: pendingUserId });
  }
}

export const userRepository = new UserRepository();
