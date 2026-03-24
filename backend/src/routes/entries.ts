import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getEntries,
  getEntryById,
  createEntry,
  deleteEntry,
  getStats,
} from '../controllers/entriesController';

const router = Router();

// All entry routes require authentication
router.use(authenticate);

router.get('/stats', getStats);
router.get('/', getEntries);
router.get('/:id', getEntryById);
router.post('/', createEntry);
router.delete('/:id', deleteEntry);

export default router;
