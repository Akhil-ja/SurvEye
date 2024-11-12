import { IUser } from '../interfaces/common.interface';

declare module 'express-serve-static-core' {
  interface Request {
    user?: IUser;
  }
}
