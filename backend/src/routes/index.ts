import { Router } from "express";
import creatorRoutes from "./creatorRoutes";
import userRoutes from "./userRoutes";
import adminRoutes from "./adminRoute";

const router = Router();

router.use("/creator", creatorRoutes);
router.use("/user", userRoutes);
router.use("/admin", adminRoutes);

export default router;
