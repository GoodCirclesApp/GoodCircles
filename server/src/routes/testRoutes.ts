import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware';
import { saveReport, listReports, getReport } from '../controllers/testController';

const router = Router();

const adminOnly = [authenticateToken, authorizeRole(['PLATFORM'])];

router.post('/report',      ...adminOnly, saveReport);
router.get('/reports',      ...adminOnly, listReports);
router.get('/reports/:id',  ...adminOnly, getReport);

export default router;
