import { Router } from "express";
import {
  initiateSignUp,
  verifyOTPAndCreateUser,
  signIn,
  forgotPassword,
  verifyForgotOTP,
  changePasswordController,
  editUserProfile,
  fetchUserProfile,
  getActiveSurveys,
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
router.put(
  "/change-password",
  protect,
  checkBlockedUser,
  changePasswordController
);
router
  .route("/profile")
  .get(protect, checkBlockedUser, fetchUserProfile)
  .put(protect, checkBlockedUser, editUserProfile);

router.get("/surveys", protect, checkBlockedUser, getActiveSurveys);

export default router;
