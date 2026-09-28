import { Router } from 'express';
import { getAllSettings, updateSetting } from '../controllers/settings.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public: get basic hotel info/policy
router.get('/', getAllSettings);

// Admin only: update setting
router.put('/:key', authenticate, authorize('ADMIN'), updateSetting);

export default router;
