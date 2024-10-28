import { Router } from "express";
import {
  initiateSignUp,
  verifyOTPAndCreateUser,
  signIn,
  forgotPassword,
  verifyForgotOTP,
} from "../controllers/userController";
import { checkBlockedUser } from "../middlewares/statusMiddleware";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

// Public routes
router.post("/signup", initiateSignUp);
router.post("/verify-otp", verifyOTPAndCreateUser);
router.post("/signin", signIn);
router.post("/forgot-password", forgotPassword);
router.post("/forgot-password/verify-otp", verifyForgotOTP);

// Protected routes
// router.put("/profile", protect, checkBlockedUser, updateProfile);

export default router;
