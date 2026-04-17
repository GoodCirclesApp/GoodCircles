import { Router } from 'express';
import * as municipalController from '../controllers/municipalController';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware';

const router = Router();
router.use(authenticateToken, authorizeRole(['PLATFORM']));

router.get('/dashboard', municipalController.getMunicipalDashboard);
router.get('/merchants', municipalController.getMunicipalMerchants);
router.get('/merchant-incentives/:merchantId', municipalController.getMerchantEligibleIncentives);

export default router;
