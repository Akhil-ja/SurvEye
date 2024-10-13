import { Router } from "express";
import {
  resendOTP,
  logout,
  forgotPasswordSendOTP,
  verifyForgotPasswordOTP,
  resendForgotPasswordSendOTP,
} from "../controllers/sharedController";

const router = Router();

router.post("/resend-otp", resendOTP);
router.post("/logout", logout);
router.post("/forgot-password", forgotPasswordSendOTP);
router.post("/verify-forgot-password", verifyForgotPasswordOTP);
router.post("/resend-password-otp", resendForgotPasswordSendOTP);

export default router;
