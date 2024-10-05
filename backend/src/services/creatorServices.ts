import bcrypt from "bcrypt";
import User from "../models/usersModel";
import { IUser } from "../models/usersModel";
import { generateToken } from "../utils/jwtUtils";

export class CreatorService {
  async createCreator(creatorData: {
    email: string;
    phoneNumber: string;
    password: string;
    creatorName: string;
    industry: string;
  }): Promise<IUser> {
    const { email, phoneNumber, password, creatorName, industry } = creatorData;

    const existingCreator = await User.findOne({ email });
    if (existingCreator) {
      throw new Error("Creator already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newCreator = new User({
      email,
      phoneNumber,
      password: hashedPassword,
      role: "creator",
      creator_name: creatorName,
      industry,
      created_at: new Date(),
      wallets: [],
      days_active: 0,
    });

    await newCreator.save();

    return newCreator;
  }

  async signIn(
    email: string,
    password: string
  ): Promise<{ user: IUser; token: string }> {
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("Email not registered");
    }

    // Check if the user's role is 'creator'
    if (user.role !== "creator") {
      // Return an error for role mismatch
      throw new Error("User is not authorized as a creator");
    }

    // Validate the password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Return a specific error if the password is wrong
      throw new Error("Incorrect password");
    }

    const token = generateToken(user.id, user.role);

    return { user, token };
  }
}

export const creatorService = new CreatorService();
