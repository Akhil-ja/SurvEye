import User, { IUser } from "../models/usersModel";
import logger from "../utils/loggerUtils";

interface IUserRepository {
  saveUser(userData: Partial<IUser>): Promise<IUser>;
  findByEmail(email: string): Promise<IUser | null>;
  findByRole(role: "user" | "creator"): Promise<IUser[]>;
  updateUser(
    userId: string,
    updatedData: Partial<IUser>
  ): Promise<IUser | null>;
  deleteUser(userId: string): Promise<void>;
}

const userRepository: IUserRepository = {
  saveUser: async (userData: Partial<IUser>): Promise<IUser> => {
    try {
      const newUser = new User(userData);
      await newUser.save();
      logger.info(`User saved: ${newUser.id}`);
      return newUser;
    } catch (error) {
      logger.error(`Error saving user: ${error}`);
      throw error;
    }
  },

  findByEmail: async (email: string): Promise<IUser | null> => {
    try {
      return await User.findOne({ email });
    } catch (error) {
      logger.error(`Error finding user by email: ${error}`);
      throw error;
    }
  },

  findByRole: async (role: "user" | "creator"): Promise<IUser[]> => {
    try {
      return await User.find({ role });
    } catch (error) {
      logger.error(`Error finding users by role: ${error}`);
      throw error;
    }
  },

  updateUser: async (
    userId: string,
    updatedData: Partial<IUser>
  ): Promise<IUser | null> => {
    try {
      const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
        new: true,
      });
      if (updatedUser) {
        logger.info(`User updated: ${userId}`);
      }
      return updatedUser;
    } catch (error) {
      logger.error(`Error updating user: ${error}`);
      throw error;
    }
  },

  deleteUser: async (userId: string): Promise<void> => {
    try {
      await User.findByIdAndDelete(userId);
      logger.info(`User deleted: ${userId}`);
    } catch (error) {
      logger.error(`Error deleting user: ${error}`);
      throw error;
    }
  },
};

export default userRepository;
