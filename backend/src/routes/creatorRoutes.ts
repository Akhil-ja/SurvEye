import { Router } from "express";
import {
  initiateSignUp,
  verifyOTPAndCreateCreator,
  signIn,
  forgotPassword,
  verifyForgotOTP,
} from "../controllers/creatorController";
import { checkBlockedUser } from "../middlewares/statusMiddleware";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

router.post("/signup", initiateSignUp);
router.post("/signin", signIn);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTPAndCreateCreator);
router.post("/forgot-password/verify-otp", verifyForgotOTP);

router.get("/check-status", protect, checkBlockedUser, (req, res) => {
  res.json({ status: "active" });
});

export default router;
