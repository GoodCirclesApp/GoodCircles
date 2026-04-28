import { Router } from 'express';
import * as adminImpactController from '../controllers/adminImpactController';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware';

const router = Router();

// Public — shown on the pre-login "View Community Impact" screen (no token required)
router.get('/platform-wide', adminImpactController.getPlatformWideImpact);

router.use(authenticateToken, authorizeRole(['PLATFORM']));

router.get('/regions', adminImpactController.getRegions);
router.get('/regions/:id/dashboard', adminImpactController.getRegionDashboard);
router.get('/regions/:id/merchants', adminImpactController.getRegionMerchants);
router.post('/municipal/:regionId/activate', adminImpactController.activateMunicipalPartnership);
router.post('/municipal/:partnerId/incentives', adminImpactController.addMunicipalIncentive);
router.post('/aggregate', adminImpactController.triggerAggregation);

export default router;
