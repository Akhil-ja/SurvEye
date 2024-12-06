import { Router } from 'express';
import {
  resendOTP,
  logout,
  forgotPasswordSendOTP,
  verifyForgotPasswordOTP,
  resendForgotPasswordSendOTP,
  googleAuth,
  createAndStoreWallet,
  AddExistingWallet,
  getWallet,
} from '../controllers/sharedController';
import { checkBlockedUser } from '../middlewares/statusMiddleware';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

// Public routes
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', forgotPasswordSendOTP);
router.post('/verify-forgot-password', verifyForgotPasswordOTP);
router.post('/resend-password-otp', resendForgotPasswordSendOTP);
router.post('/resend-password-otp', resendForgotPasswordSendOTP);
router.post('/googleAuth', googleAuth);

// Protected routes
router.post('/logout', protect, logout);
router.get('/check-status', protect, checkBlockedUser, (req, res) => {
  res.json({ status: 'active' });
});
router.post('/wallet', protect, checkBlockedUser, createAndStoreWallet);

router.post('/addWallet', protect, checkBlockedUser, AddExistingWallet);

router.get('/wallet', protect, checkBlockedUser, getWallet);

export default router;
