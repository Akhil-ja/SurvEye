import { Router } from 'express';
import creatorRoutes from './creatorRoutes';
import userRoutes from './userRoutes';
import adminRoutes from './adminRoute';
import sharedRoutes from './sharedRoutes';
import authRoutes from './authRoute';

const router = Router();

router.use('/creator', creatorRoutes);
router.use('/user', userRoutes);
router.use('/admin', adminRoutes);
router.use('/', sharedRoutes);
router.use('/api/auth', authRoutes);

export default router;
