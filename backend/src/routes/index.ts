import { Router } from 'express';
import authRoutes from './auth.routes';
import branchRoutes from './branch.routes';
import roomTypeRoutes from './roomType.routes';
import roomRoutes from './room.routes';
import amenityRoutes from './amenity.routes';
import bookingRoutes from './booking.routes';
import paymentRoutes from './payment.routes';
import invoiceRoutes from './invoice.routes';
import customerRoutes from './customer.routes';
import receptionRoutes from './reception.routes';
import offerRoutes from './offer.routes';
import reviewRoutes from './review.routes';
import reportRoutes from './report.routes';
import settingsRoutes from './settings.routes';
import auditRoutes from './audit.routes';
import notificationRoutes from './notification.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/branches', branchRoutes);
router.use('/room-types', roomTypeRoutes);
router.use('/rooms', roomRoutes);
router.use('/amenities', amenityRoutes);
router.use('/bookings', bookingRoutes);
router.use('/payments', paymentRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/customers', customerRoutes);
router.use('/reception', receptionRoutes);
router.use('/offers', offerRoutes);
router.use('/reviews', reviewRoutes);
router.use('/reports', reportRoutes);
router.use('/settings', settingsRoutes);
router.use('/audit-logs', auditRoutes);
router.use('/notifications', notificationRoutes);

export default router;
