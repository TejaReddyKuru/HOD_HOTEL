import { Router } from 'express';
import {
  validateCoupon,
  getAllOffers,
  createOffer,
  updateOffer,
  deleteOffer,
} from '../controllers/offer.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { couponSchema } from '../validators';

const router = Router();

// Public: check and validate coupon
router.post('/validate', validateCoupon);

// Offers list (public / admin)
router.get('/', getAllOffers);

// Admin only CRUD
router.post('/', authenticate, authorize('ADMIN'), validateRequest(couponSchema), createOffer);
router.put('/:id', authenticate, authorize('ADMIN'), validateRequest(couponSchema.partial()), updateOffer);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteOffer);

export default router;
