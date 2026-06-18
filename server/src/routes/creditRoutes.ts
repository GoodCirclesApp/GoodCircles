import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireFlag } from '../middleware/featureFlagMiddleware';
import * as creditController from '../controllers/creditController';

const router = Router();

router.get('/balance', authenticateToken, creditController.getCreditBalance);
router.get('/history', authenticateToken, creditController.getCreditHistory);
router.get('/eligibility', authenticateToken, creditController.getCreditEligibility);
router.get('/system-status', authenticateToken, creditController.getSystemStatus);
router.get('/merchant/eligibility', authenticateToken, creditController.getMerchantEligibility);
// Peer-to-peer credit transfer is stored-value movement — gated OFF until a BaaS phase.
router.post('/transfer', authenticateToken, requireFlag('enable_credit_transfers'), creditController.transferCredits);
router.get('/admin/velocity', authenticateToken, creditController.getVelocity);
router.put('/settings/discount-mode', authenticateToken, creditController.updateDiscountMode);

export default router;
