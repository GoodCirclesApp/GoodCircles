import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import * as mockDataController from '../controllers/mockDataController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();
router.use(authenticateToken);

// Stats & overview
router.get('/stats', adminController.getStats);
router.get('/financials', adminController.getFinancialOverview);
router.get('/system-health', adminController.getSystemHealth);
router.get('/disk-usage', adminController.getDiskUsage);

// User management
router.get('/users', adminController.getUsers);
router.get('/users/:userId', adminController.getUserDetail);
router.put('/users/:userId/status', adminController.updateUserStatus);
router.put('/users/:userId', adminController.editUser);
router.post('/users/:userId/reset-password', adminController.resetUserPassword);
router.post('/users/:userId/credits', adminController.issueCredits);
router.post('/users/:userId/balance', adminController.adjustWalletBalance);

// Admin self-service
router.post('/change-password', adminController.changeAdminPassword);

// Feature flags & demo mode
router.get('/flags', adminController.getFeatureFlags);
router.post('/flags', adminController.updateFeatureFlag);
router.get('/demo-mode', adminController.getDemoMode);
router.post('/demo-mode', adminController.setDemoMode);

// Audit log
router.get('/audit-log', adminController.getAuditLog);

// Transactions
router.get('/transactions', adminController.getTransactions);
router.post('/transactions/:txId/refund', adminController.refundTransaction);

// Demo reset
router.post('/demo/reset', adminController.adminResetDemo);

// Cooperatives & community fund
router.get('/cooperatives', adminController.getCooperatives);
router.get('/community-fund', adminController.getCommunityFundOversight);
router.get('/municipal-partners', adminController.getMunicipalPartners);
router.get('/data-coop', adminController.getDataCoopStatus);

// Price sentinel
router.get('/sentinel-flags', adminController.getSentinelFlags);
router.post('/sentinel-flags/:flagId/resolve', adminController.resolveSentinelFlag);

// Nonprofits
router.post('/seed-nonprofits', adminController.seedNonprofits);
router.get('/nonprofits/pending', adminController.getPendingNonprofits);
router.post('/nonprofits/:nonprofitId/verify', adminController.verifyNonprofitOverride);
router.post('/nonprofits/:nonprofitId/revoke-verification', adminController.revokeNonprofitVerification);

// IRS data
router.post('/irs/clear', adminController.clearIrsData);

// CDFI partner management
router.get('/cdfi', adminController.getCdfiApplicants);
router.post('/cdfi/:cdfiId/activate', adminController.activateCdfiPartner);
router.post('/cdfi/:cdfiId/deactivate', adminController.deactivateCdfiPartner);

// Mock data management
router.get('/mock-data/status', mockDataController.getMockDataStatus);
router.post('/mock-data/load', mockDataController.loadMockData);
router.post('/mock-data/unload', mockDataController.unloadMockData);
router.post('/mock-data/wipe-legacy', mockDataController.wipeLegacyData);

export default router;
