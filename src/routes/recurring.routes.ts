import { Router } from 'express';
import {
  getRecurringProfiles,
  createRecurringProfile,
  toggleRecurringProfile,
  deleteRecurringProfile,
  triggerManualRun,
} from '../controllers/recurring.controller.ts';
import { requireAuth } from '../middleware/auth.ts';

const router = Router();

router.use(requireAuth);

router.get('/', getRecurringProfiles);
router.post('/', createRecurringProfile);
router.put('/:id/toggle', toggleRecurringProfile);
router.delete('/:id', deleteRecurringProfile);
router.post('/trigger-run', triggerManualRun);

export default router;
