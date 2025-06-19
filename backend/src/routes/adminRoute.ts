import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { AdminService } from '../services/adminServices';
import { AdminRepository } from '../repositories/adminRepository';
import { SurveyRepository } from '../repositories/surveyRepository';
import { AnnouncementRepository } from '../repositories/announcementRepository';
import { TransactionRepository } from '../repositories/transactionRepository';
import { CategoryRepository } from '../repositories/categoryRepository';
import verifyAdminToken from '../middlewares/adminAuth';

const router = Router();

const adminRepository = new AdminRepository();
const surveyRepository = new SurveyRepository();
const announcementRepository = new AnnouncementRepository();
const transactionRepository = new TransactionRepository();
const categoryRepository = new CategoryRepository();

const adminService = new AdminService(
  adminRepository,
  surveyRepository,
  announcementRepository,
  transactionRepository,
  categoryRepository
);
const adminController = new AdminController(adminService);

router.post('/signin', (req, res, next) =>
  adminController.signIn(req, res, next)
);
router.post('/logout', (req, res, next) =>
  adminController.logout(req, res, next)
);

// Protected routes
router.get('/users', verifyAdminToken, (req, res, next) =>
  adminController.getAllUsers(req, res, next)
);
router.put('/users/toggleStatus', verifyAdminToken, (req, res, next) =>
  adminController.toggleStatus(req, res, next)
);

router.get('/getcategories/:isActive', (req, res, next) =>
  adminController.getAllCategories(req, res, next)
);

router.put('/category/togglestatus', verifyAdminToken, (req, res, next) =>
  adminController.toggleCategoryStatus(req, res, next)
);

router.post('/category', verifyAdminToken, (req, res, next) =>
  adminController.createCategory(req, res, next)
);

router.put('/category', verifyAdminToken, (req, res, next) =>
  adminController.updateCategory(req, res, next)
);

router.get('/getoccupation/:isActive', (req, res, next) =>
  adminController.getAllOccupations(req, res, next)
);
router.put('/occupation/toggleStatus', verifyAdminToken, (req, res, next) =>
  adminController.toggleOccupationStatus(req, res, next)
);
router.post('/occupation', verifyAdminToken, (req, res, next) =>
  adminController.createOccupation(req, res, next)
);
router.put('/occupation', verifyAdminToken, (req, res, next) =>
  adminController.updateOccupation(req, res, next)
);

router.get('/transactions', verifyAdminToken, (req, res, next) =>
  adminController.getTransactions(req, res, next)
);
router.get('/data', verifyAdminToken, (req, res, next) =>
  adminController.getData(req, res, next)
);
router.post('/admincut', verifyAdminToken, (req, res, next) =>
  adminController.createAdminCut(req, res, next)
);
router.put('/admincut', verifyAdminToken, (req, res, next) =>
  adminController.createAdminCut(req, res, next)
);
router.post('/announcement', verifyAdminToken, (req, res, next) =>
  adminController.createAnnouncement(req, res, next)
);
router.get('/announcements', (req, res, next) =>
  adminController.getAnnouncements(req, res, next)
);
router.get('/surveys', verifyAdminToken, (req, res, next) =>
  adminController.getSurveys(req, res, next)
);
router.put('/surveys/toggle-status', verifyAdminToken, (req, res, next) =>
  adminController.toggleSurveyStatus(req, res, next)
);

export default router;
