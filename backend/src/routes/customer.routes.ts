import { Router } from 'express';
import {
  getAllCustomers,
  getCustomerById,
  updateProfile,
} from '../controllers/customer.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { profileUpdateSchema } from '../validators';

const router = Router();

// Admin: view all customers
router.get('/', authenticate, authorize('ADMIN'), getAllCustomers);

// Customer update own profile
router.put('/profile', authenticate, validateRequest(profileUpdateSchema), updateProfile);

// Get specific customer (Admin or self)
router.get('/:id', authenticate, getCustomerById);

export default router;
