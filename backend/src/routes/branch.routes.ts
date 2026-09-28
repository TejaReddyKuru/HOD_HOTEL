import { Router } from 'express';
import {
  getAllBranches,
  getBranchById,
  createBranch,
  updateBranch,
  toggleBranchStatus,
  deleteBranch,
} from '../controllers/branch.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { branchSchema } from '../validators';

const router = Router();

// Public: view branches
router.get('/', getAllBranches);
router.get('/:id', getBranchById);

// Admin only: create, update, toggle status, delete
router.post('/', authenticate, authorize('ADMIN'), validateRequest(branchSchema), createBranch);
router.put('/:id', authenticate, authorize('ADMIN'), validateRequest(branchSchema.partial()), updateBranch);
router.patch('/:id/toggle-status', authenticate, authorize('ADMIN'), toggleBranchStatus);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteBranch);

export default router;
