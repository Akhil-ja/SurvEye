import { Router } from "express";
import {
  initiateSignUp,
  verifyOTPAndCreateCreator,
  signIn,
  forgotPassword,
  verifyForgotOTP,
  fetchCreatorProfile,
  editCreatorProfile,
  changePasswordController,
} from "../controllers/creatorController";
import { checkBlockedUser } from "../middlewares/statusMiddleware";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

router.post("/signup", initiateSignUp);
router.post("/signin", signIn);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTPAndCreateCreator);
router.post("/forgot-password/verify-otp", verifyForgotOTP);
router.put("/profile", protect, editCreatorProfile);
router.get("/profile", protect, fetchCreatorProfile);
router.put("/change-password", protect, changePasswordController);

export default router;
