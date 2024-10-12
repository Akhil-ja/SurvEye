import { Router } from "express";
import { resendOTP, logout } from "../controllers/sharedController";

const router = Router();

router.post("/resend-otp", resendOTP);
router.post("/logout", logout);

export default router;
