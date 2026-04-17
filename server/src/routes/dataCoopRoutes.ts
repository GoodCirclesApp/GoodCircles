import { Router } from 'express';
import * as dataCoopController from '../controllers/dataCoopController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.post('/join', dataCoopController.joinCoop);
router.post('/leave', dataCoopController.leaveCoop);
router.get('/status', dataCoopController.getStatus);
router.get('/insights', dataCoopController.getInsights);
router.post('/insights/premium', dataCoopController.purchasePremium);
router.get('/admin/dashboard', dataCoopController.getAdminDashboard);

export default router;
