import { Router } from "express";
import { adminLogout, adminSignIn } from "../controllers/adminController";

const router = Router();

router.post("/signin", adminSignIn);
router.post("/logout", adminLogout);

export default router;
