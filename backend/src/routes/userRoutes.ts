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

// User Routes
router.post("/signup", initiateSignUp, protect, checkBlockedUser);
router.post("/verify-otp", verifyOTPAndCreateUser);
router.post("/signin", signIn, protect, checkBlockedUser);
router.post("/forgot-password", forgotPassword);
router.post("/forgot-password/verify-otp", verifyForgotOTP);
router.put("/profile", verifyForgotOTP);

export default router;
