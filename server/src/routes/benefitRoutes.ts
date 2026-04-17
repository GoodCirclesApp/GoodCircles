import { Router } from 'express';
import * as benefitController from '../controllers/benefitController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();
router.use(authenticateToken);

router.get('/programs', benefitController.getPrograms);
router.post('/programs/:id/enroll', benefitController.enroll);
router.get('/merchant/eligibility', benefitController.getEligibility);
router.get('/merchant/:merchantId', benefitController.getMerchantBenefits);
router.get('/admin/stats', benefitController.getAdminStats);

export default router;
