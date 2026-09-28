import { Router } from 'express';
import {
  getAllAmenities,
  createAmenity,
  updateAmenity,
  deleteAmenity,
} from '../controllers/amenity.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { amenitySchema } from '../validators';

const router = Router();

router.get('/', getAllAmenities);
router.post('/', authenticate, authorize('ADMIN'), validateRequest(amenitySchema), createAmenity);
router.put('/:id', authenticate, authorize('ADMIN'), validateRequest(amenitySchema.partial()), updateAmenity);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteAmenity);

export default router;
