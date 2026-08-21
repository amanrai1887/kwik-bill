import { Router } from 'express';
import {
  getRecurringProfiles,
  createRecurringProfile,
  toggleRecurringProfile,
  deleteRecurringProfile,
  triggerManualRun,
} from '../controllers/recurring.controller.ts';
import { requireAuth } from '../middleware/auth.ts';
import { cacheResponse } from '../middleware/cacheMiddleware.ts';
import { validateBody } from '../middleware/validate.ts';
import { createRecurringSchema } from '../lib/validators/index.ts';

const router = Router();

router.use(requireAuth);

router.get('/', cacheResponse('recurring', 180), getRecurringProfiles);
router.post('/', validateBody(createRecurringSchema), createRecurringProfile);
router.put('/:id/toggle', toggleRecurringProfile);
router.delete('/:id', deleteRecurringProfile);
router.post('/trigger-run', triggerManualRun);

export default router;
