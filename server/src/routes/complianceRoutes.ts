import { Router } from 'express';
import * as complianceController from '../controllers/complianceController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();
router.use(authenticateToken);

// IRS Verification
router.get('/irs/check/:ein', complianceController.checkNonprofitStatus);
router.post('/irs/sync', complianceController.triggerIrsSync);
router.get('/irs/sync-logs', complianceController.getIrsSyncLogs);

// Compliance deadline calendar
router.get('/deadlines', complianceController.getDeadlines);
router.post('/deadlines/:id/complete', complianceController.markDeadlineComplete);

// CCV campaign tracker
router.get('/ccv-campaigns', complianceController.getCcvCampaigns);
router.post('/ccv-campaigns', complianceController.createCcvCampaign);

// Mission report
router.get('/mission-report', complianceController.getMissionReport);

// Tax reporting
router.get('/1099k', complianceController.get1099KReport);
router.get('/1099k/export', complianceController.export1099KCsv);
router.post('/1099k/notify', complianceController.notify1099KMerchants);

// INFORM Act
router.get('/inform-act', complianceController.getInformActQueue);
router.post('/inform-act/:merchantId/verify', complianceController.markInformVerified);

// State-tagged reports (CCV audit)
router.get('/state-report', complianceController.getStateReport);

export default router;
