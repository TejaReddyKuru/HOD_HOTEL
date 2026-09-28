import { Router } from 'express';
import {
  getDashboardStats,
  getRevenueReport,
  exportReportsCsv,
} from '../controllers/report.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate, authorize('ADMIN', 'RECEPTION'));

router.get('/dashboard', getDashboardStats);
router.get('/revenue', getRevenueReport);
router.get('/export-csv', exportReportsCsv);

export default router;
