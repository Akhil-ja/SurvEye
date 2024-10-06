import { Router } from "express";
import {
  initiateSignUp,
  verifyOTPAndCreateCreator,
  signIn,
  forgotPassword,
  verifyForgotOTP,
  logout,
} from "../controllers/creatorController";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

router.post("/signup", initiateSignUp);
router.post("/verify-otp", verifyOTPAndCreateCreator);
router.post("/signin", signIn);
router.post("/forgot-password", forgotPassword);
router.post("/forgot-password/verify-otp", verifyForgotOTP);
router.post("/logout", logout);

export default router;
