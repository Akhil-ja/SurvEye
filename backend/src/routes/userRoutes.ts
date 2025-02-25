import { Router } from 'express';
import { checkBlockedUser } from '../middlewares/statusMiddleware';
import { protect } from '../middlewares/authMiddleware';
import { SurveyRepository } from '../repositories/surveyRepository';
import { UserService } from '../services/userServices';
import { UserController } from '../controllers/userController';
import { NotificationRepository } from '../repositories/notificationRepository';
import { TransactionRepository } from '../repositories/transactionRepository';
import { UserRepository } from '../repositories/userRepository';
import { SurveyResponseRepository } from '../repositories/surveyResponseRepository';
import { WalletRepository } from '../repositories/walletRepository';
import { CategoryRepository } from '../repositories/categoryRepository';

const router = Router();

const surveyRepository = new SurveyRepository();
const notificationRepository = new NotificationRepository();
const transactionRepository = new TransactionRepository();
const surveyResponseRepository = new SurveyResponseRepository();
const walletRepository = new WalletRepository();
const userRepository = new UserRepository();
const categoryRepository = new CategoryRepository();

const userService = new UserService(
  surveyRepository,
  notificationRepository,
  transactionRepository,
  userRepository,
  surveyResponseRepository,
  walletRepository,
  categoryRepository
);
const userController = new UserController(userService);

router.post('/signup', (req, res, next) =>
  userController.initiateSignUp(req, res, next)
);
router.post('/verify-otp', (req, res, next) =>
  userController.verifyOTPAndCreateUser(req, res, next)
);
router.post('/signin', (req, res, next) =>
  userController.signIn(req, res, next)
);
router.post('/forgot-password', (req, res, next) =>
  userController.forgotPassword(req, res, next)
);
router.post('/forgot-password/verify-otp', (req, res, next) =>
  userController.verifyForgotOTP(req, res, next)
);

router.put('/change-password', protect, checkBlockedUser, (req, res, next) =>
  userController.changePasswordController(req, res, next)
);
router
  .route('/profile')
  .get(protect, checkBlockedUser, (req, res, next) =>
    userController.fetchUserProfile(req, res, next)
  )
  .put(protect, checkBlockedUser, (req, res, next) =>
    userController.editUserProfile(req, res, next)
  );

router.get('/surveys', protect, checkBlockedUser, (req, res, next) =>
  userController.getActiveSurveys(req, res, next)
);
router.get('/surveyinfo', protect, checkBlockedUser, (req, res, next) =>
  userController.getSurveyinfo(req, res, next)
);
router.post(
  '/survey/:surveyId/submit',
  protect,
  checkBlockedUser,
  (req, res, next) => userController.submitSurveyResponse(req, res, next)
);
router.get(
  '/getcategories/:isActive',
  protect,
  checkBlockedUser,
  (req, res, next) => userController.getAllCategories(req, res, next)
);

router.post('/wallet/send-sol', protect, checkBlockedUser, (req, res, next) =>
  userController.sendSOLToken(req, res, next)
);
router.post('/wallet/payout', protect, checkBlockedUser, (req, res, next) =>
  userController.payoutToWallet(req, res, next)
);

export default router;
