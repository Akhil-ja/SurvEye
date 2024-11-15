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

router.get('/getcategories', (req, res, next) => {
  adminController.getAllCategories(req, res, next);
});

export default router;
