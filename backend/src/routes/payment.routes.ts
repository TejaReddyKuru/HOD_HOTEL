import { Router } from 'express';
import { recordDeskPayment, getAllPayments } from '../controllers/payment.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { deskPaymentSchema } from '../validators';

const router = Router();

// Record physical desk payment (NO GATEWAY)
router.post(
  '/record-desk',
  authenticate,
  authorize('RECEPTION', 'ADMIN'),
  validateRequest(deskPaymentSchema),
  recordDeskPayment
);

// Get payments ledger
router.get('/', authenticate, authorize('RECEPTION', 'ADMIN'), getAllPayments);

export default router;
