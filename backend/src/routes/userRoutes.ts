import { Router } from "express";
import {
  initiateSignUp,
  verifyOTPAndCreateUser,
  signIn,
} from "../controllers/userController";

const router = Router();

// User Routes
router.post("/signup", initiateSignUp);
router.post("/verify-otp", verifyOTPAndCreateUser);
router.post("/signin", signIn);

export default router;
