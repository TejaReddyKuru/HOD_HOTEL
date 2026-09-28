import { Router } from 'express';
import {
  getAllReceptionStaff,
  createReceptionStaff,
  updateReceptionStaff,
} from '../controllers/reception.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { receptionCreateSchema, receptionUpdateSchema } from '../validators';

const router = Router();

// Only ADMIN can manage Reception accounts (RULE 10)
router.use(authenticate, authorize('ADMIN'));

router.get('/', getAllReceptionStaff);
router.post('/', validateRequest(receptionCreateSchema), createReceptionStaff);
router.put('/:id', validateRequest(receptionUpdateSchema), updateReceptionStaff);

export default router;
