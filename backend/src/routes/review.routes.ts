import { Router } from 'express';
import {
  getReviews,
  createReview,
  toggleHideReview,
  deleteReview,
} from '../controllers/review.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { reviewSchema } from '../validators';

const router = Router();

// Public: view reviews
router.get('/', getReviews);

// Customer: submit review for completed stay
router.post('/', authenticate, authorize('CUSTOMER'), validateRequest(reviewSchema), createReview);

// Admin: hide or delete review
router.patch('/:id/toggle-hide', authenticate, authorize('ADMIN'), toggleHideReview);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteReview);

export default router;
