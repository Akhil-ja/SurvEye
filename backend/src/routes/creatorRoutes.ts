import { Router } from 'express';
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
  makeSurvey,
  getAllSurveys,
  publishSurvey,
  surveyAnalytics,
  getNotifications,
} from '../controllers/creatorController';
import { checkBlockedUser } from '../middlewares/statusMiddleware';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

// Public routes
router.post('/signup', initiateSignUp);
router.post('/verify-otp', verifyOTPAndCreateCreator);
router.post('/signin', signIn);
router.post('/forgot-password', forgotPassword);
router.post('/forgot-password/verify-otp', verifyForgotOTP);

// Protected routes
router.put(
  '/change-password',
  protect,
  checkBlockedUser,
  changePasswordController
);
router
  .route('/profile')
  .get(protect, checkBlockedUser, fetchCreatorProfile)
  .put(protect, checkBlockedUser, editCreatorProfile);

router.post('/survey', protect, checkBlockedUser, createSurvey);
router.get('/survey', protect, checkBlockedUser, getSurvey);
router.get('/surveys', protect, checkBlockedUser, getAllSurveys);
router.post('/createsurvey', protect, checkBlockedUser, makeSurvey);
router.put('/publishsurvey', protect, checkBlockedUser, publishSurvey);
router.get('/notifications', protect, checkBlockedUser, getNotifications);
router.get(
  '/survey/:surveyId/analytics',
  protect,
  checkBlockedUser,
  surveyAnalytics
);

export default router;
