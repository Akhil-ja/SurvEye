import { Router } from 'express';
import { checkBlockedUser } from '../middlewares/statusMiddleware';
import { protect } from '../middlewares/authMiddleware';
import { SurveyRepository } from '../repositories/surveyRepository';
import { CreatorService } from '../services/creatorServices';
import { CreatorController } from '../controllers/creatorController';
import { NotificationRepository } from '../repositories/notificationRepository';
import { UserRepository } from '../repositories/userRepository';
import { SurveyResponseRepository } from '../repositories/surveyResponseRepository';
import { CategoryRepository } from '../repositories/categoryRepository';

const router = Router();

const surveyRepository = new SurveyRepository();
const notificationRepository = new NotificationRepository();
const userRepository = new UserRepository();
const surveyResponseRepository = new SurveyResponseRepository();
const categoryRepository = new CategoryRepository();

const creatorService = new CreatorService(
  surveyRepository,
  notificationRepository,
  userRepository,
  surveyResponseRepository,
  categoryRepository
);
const creatorController = new CreatorController(creatorService);

// Public routes
router.post('/signup', (req, res, next) =>
  creatorController.initiateSignUp(req, res, next)
);
router.post('/verify-otp', (req, res, next) =>
  creatorController.verifyOTPAndCreateCreator(req, res, next)
);
router.post('/signin', (req, res, next) =>
  creatorController.signIn(req, res, next)
);
router.post('/forgot-password', (req, res, next) =>
  creatorController.forgotPassword(req, res, next)
);
router.post('/forgot-password/verify-otp', (req, res, next) =>
  creatorController.verifyForgotOTP(req, res, next)
);

// Protected routes
router.put('/change-password', protect, checkBlockedUser, (req, res, next) =>
  creatorController.changePasswordController(req, res, next)
);
router
  .route('/profile')
  .get(protect, checkBlockedUser, (req, res, next) =>
    creatorController.fetchCreatorProfile(req, res, next)
  )
  .put(protect, checkBlockedUser, (req, res, next) =>
    creatorController.editCreatorProfile(req, res, next)
  );

router.post('/survey', protect, checkBlockedUser, (req, res, next) =>
  creatorController.createSurvey(req, res, next)
);
router.get('/survey', protect, checkBlockedUser, (req, res, next) =>
  creatorController.getSurvey(req, res, next)
);
router.get('/surveys', protect, checkBlockedUser, (req, res, next) =>
  creatorController.getAllSurveys(req, res, next)
);
router.post('/createsurvey', protect, checkBlockedUser, (req, res, next) =>
  creatorController.makeSurvey(req, res, next)
);
router.put('/publishsurvey', protect, checkBlockedUser, (req, res, next) =>
  creatorController.publishSurvey(req, res, next)
);
router.get('/notifications', protect, checkBlockedUser, (req, res, next) =>
  creatorController.getNotifications(req, res, next)
);
router.get(
  '/survey/:surveyId/analytics',
  protect,
  checkBlockedUser,
  (req, res, next) => creatorController.surveyAnalytics(req, res, next)
);

export default router;
