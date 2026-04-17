import { Router } from 'express';
import * as benefitController from '../controllers/benefitController';

const router = Router();

router.get('/programs', benefitController.getPrograms);
router.post('/programs/:id/enroll', benefitController.enroll);
router.get('/merchant/eligibility', benefitController.getEligibility);
router.get('/merchant/:merchantId', benefitController.getMerchantBenefits);
router.get('/admin/stats', benefitController.getAdminStats);

export default router;
