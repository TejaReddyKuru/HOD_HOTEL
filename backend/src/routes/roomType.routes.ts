import { Router } from 'express';
import {
  getAllRoomTypes,
  getRoomTypeById,
  createRoomType,
  updateRoomType,
  deleteRoomType,
} from '../controllers/roomType.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { roomTypeSchema } from '../validators';

const router = Router();

router.get('/', getAllRoomTypes);
router.get('/:id', getRoomTypeById);
router.post('/', authenticate, authorize('ADMIN'), validateRequest(roomTypeSchema), createRoomType);
router.put('/:id', authenticate, authorize('ADMIN'), validateRequest(roomTypeSchema.partial()), updateRoomType);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteRoomType);

export default router;
