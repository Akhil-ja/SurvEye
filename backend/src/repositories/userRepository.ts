import User, { IUser } from "../models/usersModel";

const userRepository = {
  saveUser: async (userData: Partial<IUser>) => {
    const newUser = new User(userData);
    await newUser.save();
    console.log("User saved:", newUser);
    return newUser;
  },

  findByEmail: async (email: string) => {
    return await User.findOne({ email });
  },

  findByRole: async (role: "user" | "creator") => {
    return await User.find({ role });
  },

  updateUser: async (userId: string, updatedData: Partial<IUser>) => {
    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    });
    return updatedUser;
  },

  deleteUser: async (userId: string) => {
    await User.findByIdAndDelete(userId);
    console.log("User deleted:", userId);
  },
};

export default userRepository;
