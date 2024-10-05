import { Router } from "express";
import creatorRoutes from "./creatorRoutes";
import userRoutes from "./userRoutes";

const router = Router();

// Define the main routes for User and Creator
router.use("/creator", creatorRoutes); // Prefix with /creator
router.use("/user", userRoutes); // Prefix with /creator

export default router;
