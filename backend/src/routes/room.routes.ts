import { Router } from 'express';
import {
  searchAvailableRooms,
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  updateRoomStatus,
  deleteRoom,
} from '../controllers/room.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { roomSchema, roomStatusSchema } from '../validators';

const router = Router();

// Public availability search
router.get('/search', searchAvailableRooms);

// Authenticated or filtered list of rooms
router.get('/', authenticate, getAllRooms);
router.get('/:id', getRoomById);

// Admin only room creation, updates, and deletion
router.post('/', authenticate, authorize('ADMIN'), validateRequest(roomSchema), createRoom);
router.put('/:id', authenticate, authorize('ADMIN'), validateRequest(roomSchema.partial()), updateRoom);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteRoom);

// Reception & Admin can change room status (e.g., CLEANING -> AVAILABLE)
router.patch(
  '/:id/status',
  authenticate,
  authorize('ADMIN', 'RECEPTION'),
  validateRequest(roomStatusSchema),
  updateRoomStatus
);

export default router;
