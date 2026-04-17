import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import * as creditController from '../controllers/creditController';

const router = Router();

router.get('/balance', authenticateToken, creditController.getCreditBalance);
router.get('/history', authenticateToken, creditController.getCreditHistory);
router.get('/eligibility', authenticateToken, creditController.getCreditEligibility);
router.get('/system-status', authenticateToken, creditController.getSystemStatus);
router.get('/merchant/eligibility', authenticateToken, creditController.getMerchantEligibility);
router.post('/transfer', authenticateToken, creditController.transferCredits);
router.get('/admin/velocity', authenticateToken, creditController.getVelocity);
router.put('/settings/discount-mode', authenticateToken, creditController.updateDiscountMode);

export default router;
