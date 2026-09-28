import { Router } from 'express';
import {
  checkAvailabilityAndPrice,
  createCustomerBooking,
  createWalkInBooking,
  checkInGuest,
  checkOutGuest,
  addExtraCharge,
  cancelBooking,
  changeRoom,
  getAllBookings,
  getBookingById,
} from '../controllers/booking.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import {
  createBookingSchema,
  walkInBookingSchema,
  extraChargeSchema,
} from '../validators';

const router = Router();

// Availability check & price quote preview
router.post('/check-availability', checkAvailabilityAndPrice);

// Customer reservation (Desk payment)
router.post(
  '/',
  authenticate,
  authorize('CUSTOMER', 'ADMIN'),
  validateRequest(createBookingSchema),
  createCustomerBooking
);

// Reception Walk-in booking
router.post(
  '/walk-in',
  authenticate,
  authorize('RECEPTION', 'ADMIN'),
  validateRequest(walkInBookingSchema),
  createWalkInBooking
);

// Check-in guest
router.post('/:id/check-in', authenticate, authorize('RECEPTION', 'ADMIN'), checkInGuest);

// Check-out guest
router.post('/:id/check-out', authenticate, authorize('RECEPTION', 'ADMIN'), checkOutGuest);

// Add extra charges
router.post(
  '/:id/extra-charges',
  authenticate,
  authorize('RECEPTION', 'ADMIN'),
  validateRequest(extraChargeSchema),
  addExtraCharge
);

// Change room
router.post('/:id/change-room', authenticate, authorize('RECEPTION', 'ADMIN'), changeRoom);

// Cancel booking
router.post('/:id/cancel', authenticate, cancelBooking);

// List & Get details
router.get('/', authenticate, getAllBookings);
router.get('/:id', authenticate, getBookingById);

export default router;
