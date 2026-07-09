import { Router } from 'express';
import { Response, NextFunction } from 'express';
import * as complianceController from '../controllers/complianceController';
import { authenticateToken, authorizeRole, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// SECURITY (compliance audit D5, 2026-07-09): these endpoints expose merchant
// 1099-K tax data, INFORM Act seller PII, IRS/state syncs and CCV ledgers. They
// were previously gated by authenticateToken ONLY, so any authenticated user of
// any role could read them. Restrict to platform staff; PLATFORM_VIEWER is
// read-only (blocked on every state-changing request, incl. POST sync triggers).
router.use(authenticateToken);
router.use(authorizeRole(['PLATFORM', 'PLATFORM_VIEWER']));
router.use((req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.method !== 'GET' && req.user?.role === 'PLATFORM_VIEWER') {
    return res.status(403).json({ error: 'View-only account. This action is not permitted.' });
  }
  next();
});

// IRS Verification
router.get('/irs/check/:ein', complianceController.checkNonprofitStatus);
router.post('/irs/sync', complianceController.triggerIrsSync);
router.get('/irs/sync-logs', complianceController.getIrsSyncLogs);
router.get('/irs/sync-status', complianceController.getIrsSyncStatus);

// Compliance deadline calendar
router.get('/deadlines', complianceController.getDeadlines);
router.post('/deadlines/:id/complete', complianceController.markDeadlineComplete);

// CCV campaign tracker
router.get('/ccv-campaigns', complianceController.getCcvCampaigns);
router.post('/ccv-campaigns', complianceController.createCcvCampaign);
router.get('/ccv-campaigns/:campaignId/ledger', complianceController.getCampaignLedger);
router.get('/ccv-campaigns/:campaignId/ct6cf', complianceController.getCt6cfReport);
router.get('/ccv-campaigns/:campaignId/contract', complianceController.getCampaignContract);
router.post('/ccv-campaigns/:campaignId/contract/sign', complianceController.signCampaignContract);

// State AG standing
router.get('/state-standing/status', complianceController.getStateStandingStatus);
router.post('/state-standing/sync', complianceController.triggerStateStandingSync);
router.get('/state-standing/:ein', complianceController.checkNonprofitStateStanding);

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
