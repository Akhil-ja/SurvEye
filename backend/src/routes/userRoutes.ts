import { Router } from "express";
import {
  initiateSignUp,
  verifyOTPAndCreateUser,
  signIn,
  forgotPassword,
  verifyForgotOTP,
  logout,
} from "../controllers/userController";

const router = Router();

// User Routes
router.post("/signup", initiateSignUp);
router.post("/verify-otp", verifyOTPAndCreateUser);
router.post("/signin", signIn);
router.post("/forgot-password", forgotPassword);
router.post("/forgot-password/verify-otp", verifyForgotOTP);
router.post("/logout", logout);

export default router;
