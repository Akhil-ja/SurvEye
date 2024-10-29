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
  createSurvey,
  getSurvey,
} from "../controllers/creatorController";
import { checkBlockedUser } from "../middlewares/statusMiddleware";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

// Public routes
router.post("/signup", initiateSignUp);
router.post("/verify-otp", verifyOTPAndCreateCreator);
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
  .get(protect, checkBlockedUser, fetchCreatorProfile)
  .put(protect, checkBlockedUser, editCreatorProfile);

router.post("/survey", protect, checkBlockedUser, createSurvey);
router.get("/survey", protect, checkBlockedUser, getSurvey);

export default router;
