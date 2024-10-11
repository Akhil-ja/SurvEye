import { Router } from "express";
import creatorRoutes from "./creatorRoutes";
import userRoutes from "./userRoutes";
import adminRoutes from "./adminRoute";
import sharedRoutes from "./sharedRoutes";

const router = Router();

router.use("/creator", creatorRoutes);
router.use("/user", userRoutes);
router.use("/admin", adminRoutes);
router.use("/", sharedRoutes);

export default router;
