import { Router } from 'express';
import { checkBlockedUser } from '../middlewares/statusMiddleware';
import { protect } from '../middlewares/authMiddleware';
import { SurveyRepository } from '../repositories/surveyRepository';
import { SharedService } from '../services/sharedServices';
import { SharedController } from '../controllers/sharedController';
import { TransactionRepository } from '../repositories/transactionRepository';
import { UserRepository } from '../repositories/userRepository';
import { WalletRepository } from '../repositories/walletRepository';

const router = Router();

const surveyRepository = new SurveyRepository();
const transactionRepository = new TransactionRepository();
const userRepository = new UserRepository();
const walletRepository = new WalletRepository();
const sharedService = new SharedService(
  surveyRepository,
  transactionRepository,
  userRepository,
  walletRepository
);
const sharedController = new SharedController(sharedService);

router.post('/resend-otp', (req, res, next) =>
  sharedController.resendOTP(req, res, next)
);
router.post('/forgot-password', (req, res, next) =>
  sharedController.forgotPasswordSendOTP(req, res, next)
);
router.post('/verify-forgot-password', (req, res, next) =>
  sharedController.verifyForgotPasswordOTP(req, res, next)
);
router.post('/resend-password-otp', (req, res, next) =>
  sharedController.resendForgotPasswordSendOTP(req, res, next)
);
router.post('/googleAuth', (req, res, next) =>
  sharedController.googleAuth(req, res, next)
);

router.post('/logout', protect, (req, res, next) =>
  sharedController.logout(req, res, next)
);
router.get('/check-status', protect, checkBlockedUser, (req, res) => {
  res.json({ status: 'active' });
});
router.post('/wallet', protect, checkBlockedUser, (req, res, next) =>
  sharedController.createAndStoreWallet(req, res, next)
);
router.post('/addWallet', protect, checkBlockedUser, (req, res, next) =>
  sharedController.AddExistingWallet(req, res, next)
);
router.get('/wallet', protect, checkBlockedUser, (req, res, next) =>
  sharedController.getWallet(req, res, next)
);
router.get(
  '/wallet/transactions',
  protect,
  checkBlockedUser,
  (req, res, next) => sharedController.getTransactions(req, res, next)
);
router.post(
  '/wallet/transactions',
  protect,
  checkBlockedUser,
  (req, res, next) => sharedController.makeTransaction(req, res, next)
);

export default router;
