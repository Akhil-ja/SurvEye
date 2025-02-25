import { IAdmin, IUser, IOccupation, IAdminCut } from '../common.interface';
import { Types } from 'mongoose';

export interface IAdminRepository {
  findByEmail(email: string): Promise<IAdmin | null>;
  findById(id: Types.ObjectId): Promise<IAdmin | null>;
  findUserById(userId: string): Promise<IUser | null>;
  getAllUsers(): Promise<IUser[]>;
  saveUser(user: IUser): Promise<IUser>;

  //Occupation
  getAllOccupations(acive: boolean): Promise<IOccupation[]>;
  saveOccupation(occupation: IOccupation): Promise<IOccupation>;
  createOccupation(OccupationData: Partial<IOccupation>): Promise<IOccupation>;
  findOccupationById(occupationId: string): Promise<IOccupation | null>;
  updateOccupation(
    occupationId: string,
    OccupationData: Partial<IOccupation>
  ): Promise<IOccupation>;

  //control panel
  getAllData(): Promise<any>;
  createAdminCut(percentage: number): Promise<IAdminCut>;
  editAdminCut(percentage: number): Promise<IAdminCut>;
  getAdminCut(): Promise<any>;
}
