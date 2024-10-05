// backend/src/repositories/userRepository.ts

import User, { IUser } from "../models/usersModel";

const userRepository = {
  // Save a new user or creator
  saveUser: async (userData: Partial<IUser>) => {
    const newUser = new User(userData);
    await newUser.save();
    console.log("User saved:", newUser);
    return newUser;
  },

  // Find a user by email
  findByEmail: async (email: string) => {
    return await User.findOne({ email });
  },

  // Find a user by role
  findByRole: async (role: "user" | "creator") => {
    return await User.find({ role });
  },

  // Update a user's details
  updateUser: async (userId: string, updatedData: Partial<IUser>) => {
    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    });
    return updatedUser;
  },

  // Delete a user by ID
  deleteUser: async (userId: string) => {
    await User.findByIdAndDelete(userId);
    console.log("User deleted:", userId);
  },
};

export default userRepository;
