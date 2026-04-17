import { Router } from 'express';
import * as municipalController from '../controllers/municipalController';

const router = Router();

router.get('/dashboard', municipalController.getMunicipalDashboard);
router.get('/merchants', municipalController.getMunicipalMerchants);
router.get('/merchant-incentives/:merchantId', municipalController.getMerchantEligibleIncentives);

export default router;
