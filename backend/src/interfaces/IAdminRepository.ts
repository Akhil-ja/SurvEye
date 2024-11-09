import { IAdmin, IUser } from '../interfaces/common.interface';
import { Types } from 'mongoose';

export interface IAdminRepository {
  findByEmail(email: string): Promise<IAdmin | null>;
  findById(id: Types.ObjectId): Promise<IAdmin | null>;
  findUserById(userId: string): Promise<IUser | null>;
  getAllUsers(): Promise<IUser[]>;
  saveUser(user: IUser): Promise<IUser>;
}
