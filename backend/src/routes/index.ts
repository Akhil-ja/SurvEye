import { Router } from "express";
import creatorRoutes from "./creatorRoutes";
import userRoutes from "./userRoutes";

const router = Router();

router.use("/creator", creatorRoutes);
router.use("/user", userRoutes);

export default router;
