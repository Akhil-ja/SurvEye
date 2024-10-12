import { Router } from "express";
import {
  initiateSignUp,
  verifyOTPAndCreateCreator,
  signIn,
  forgotPassword,
  verifyForgotOTP,
} from "../controllers/creatorController";

const router = Router();

router.post("/signup", initiateSignUp);
router.post("/verify-otp", verifyOTPAndCreateCreator);
router.post("/signin", signIn);
router.post("/forgot-password", forgotPassword);
router.post("/forgot-password/verify-otp", verifyForgotOTP);

export default router;
