import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getWeeklySummary } from '../controllers/aiController';

const router = Router();

router.get('/summary', authenticate, getWeeklySummary);

export default router;
