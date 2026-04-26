import { Router } from 'express';
import * as cdfiController from '../controllers/cdfiController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();
router.use(authenticateToken);

router.get('/:id/dashboard', cdfiController.getDashboard);
router.get('/:id/applications', cdfiController.getApplications);
router.post('/applications/:id/evaluate', cdfiController.evaluateApplication);
router.put('/:cdfiId/applications/:id/approve', cdfiController.approveApplication);
router.put('/:cdfiId/applications/:id/deny', cdfiController.denyApplication);
router.get('/:id/impact', cdfiController.getImpact);

// Merchant packaging (auto-matched merchants in CDFI target census tracts)
router.get('/:id/packages', cdfiController.getMerchantPackages);
router.put('/:cdfiId/packages/:packageId/status', cdfiController.updatePackageStatus);

// TLR CSV export
router.get('/:id/tlr-export', cdfiController.exportTlrCsv);

// Manual census tract geocode trigger for a merchant
router.post('/merchants/:merchantId/geocode', cdfiController.geocodeMerchant);

// CDFI profile settings & activation
router.put('/:id/settings', cdfiController.updateCdfiSettings);
router.post('/:id/activate', cdfiController.activateCdfi);

export default router;
