import { Router } from 'express';
import { getInvoiceByBooking } from '../controllers/invoice.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/booking/:bookingId', authenticate, getInvoiceByBooking);

export default router;
