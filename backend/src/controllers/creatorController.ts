import { Request, Response } from "express";
import { creatorService } from "../services/creatorServices";

export const createCreator = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, phoneNumber, password, creatorName, industry } = req.body;

  try {
    const newCreator = await creatorService.createCreator({
      email,
      phoneNumber,
      password,
      creatorName,
      industry,
    });

    res.status(201).json({
      message: "Creator created successfully",
      creator: {
        id: newCreator.id,
        email: newCreator.email,
        phoneNumber: newCreator.phoneNumber,
        creator_name: newCreator.creator_name,
        industry: newCreator.industry,
        created_at: newCreator.created_at,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Creator already exists") {
      res.status(409).json({ message: error.message });
    } else {
      console.error(error);
      res.status(500).json({
        message: "Server error",
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }
};

export const signIn = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const { user, token } = await creatorService.signIn(email, password);

    res.status(200).json({
      message: "Sign in successful",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        creator_name: user.creator_name,
        first_name: user.first_name,
        last_name: user.last_name,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({
      message: "Authentication failed",
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
};
