import { Router } from "express";
import {
  initiateSignUp,
  verifyOTPAndCreateUser,
  signIn,
  forgotPassword,
  verifyForgotOTP,
} from "../controllers/userController";

const router = Router();

// User Routes
router.post("/signup", initiateSignUp);
router.post("/verify-otp", verifyOTPAndCreateUser);
router.post("/signin", signIn);
router.post("/forgot-password", forgotPassword);
router.post("/forgot-password/verify-otp", verifyForgotOTP);

export default router;
