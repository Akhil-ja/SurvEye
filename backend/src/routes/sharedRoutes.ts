import { Router } from "express";
import {
  resendOTP,
  logout,
  forgotPasswordSendOTP,
  verifyForgotPasswordOTP,
  resendForgotPasswordSendOTP,
} from "../controllers/sharedController";
import { checkBlockedUser } from "../middlewares/statusMiddleware";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

router.post("/resend-otp", resendOTP);
router.post("/logout", logout);
router.post("/forgot-password", forgotPasswordSendOTP);
router.post("/verify-forgot-password", verifyForgotPasswordOTP);
router.post("/resend-password-otp", resendForgotPasswordSendOTP);

router.get("/check-status", protect, checkBlockedUser, (req, res) => {
  res.json({ status: "active" });
});

export default router;
