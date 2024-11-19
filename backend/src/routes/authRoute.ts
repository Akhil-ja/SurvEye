import express from 'express';
import { refreshTokens } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/refresh-token', refreshTokens);

export default router;
