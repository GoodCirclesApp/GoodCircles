import { Router } from 'express';
import * as adminImpactController from '../controllers/adminImpactController';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware';

const router = Router();
router.use(authenticateToken, authorizeRole(['PLATFORM']));

router.get('/regions', adminImpactController.getRegions);
router.get('/regions/:id/dashboard', adminImpactController.getRegionDashboard);
router.get('/regions/:id/merchants', adminImpactController.getRegionMerchants);
router.get('/impact/platform-wide', adminImpactController.getPlatformWideImpact);
router.post('/municipal/:regionId/activate', adminImpactController.activateMunicipalPartnership);
router.post('/municipal/:partnerId/incentives', adminImpactController.addMunicipalIncentive);
router.post('/impact/aggregate', adminImpactController.triggerAggregation);

export default router;
