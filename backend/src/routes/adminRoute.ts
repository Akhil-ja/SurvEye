import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { AdminService } from '../services/adminServices';
import { AdminRepository } from '../repositories/adminRepository';

const router = Router();

const adminRepository = new AdminRepository();
const adminService = new AdminService(adminRepository);
const adminController = new AdminController(adminService);

router.post('/signin', (req, res, next) =>
  adminController.signIn(req, res, next)
);
router.post('/logout', (req, res, next) =>
  adminController.logout(req, res, next)
);
router.get('/users', (req, res, next) =>
  adminController.getAllUsers(req, res, next)
);
router.put('/users/toggleStatus', (req, res, next) =>
  adminController.toggleStatus(req, res, next)
);

router.get('/getcategories/:isActive', (req, res, next) => {
  adminController.getAllCategories(req, res, next);
});

router.put('/category/togglestatus', (req, res, next) => {
  adminController.toggleCategoryStatus(req, res, next);
});

router.post('/category', (req, res, next) => {
  adminController.createCategory(req, res, next);
});

router.put('/category', (req, res, next) => {
  adminController.updateCategory(req, res, next);
});

// Occupation Routes
router.get('/getoccupation/:isActive', (req, res, next) => {
  adminController.getAllOccupations(req, res, next);
});
router.put('/occupation/toggleStatus', (req, res, next) => {
  adminController.toggleOccupationStatus(req, res, next);
});
router.post('/occupation', (req, res, next) => {
  adminController.createOccupation(req, res, next);
});
router.put('/occupation', (req, res, next) => {
  adminController.updateOccupation(req, res, next);
});

export default router;
