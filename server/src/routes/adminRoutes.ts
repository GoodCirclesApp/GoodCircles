
import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import * as mockDataController from '../controllers/mockDataController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// All admin routes require authentication
router.use(authenticateToken);

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.put('/users/:userId/status', adminController.updateUserStatus);
router.get('/transactions', adminController.getTransactions);
router.post('/transactions/:txId/refund', adminController.refundTransaction);
router.get('/financials', adminController.getFinancialOverview);
router.get('/cooperatives', adminController.getCooperatives);
router.get('/community-fund', adminController.getCommunityFundOversight);
router.get('/municipal-partners', adminController.getMunicipalPartners);
router.get('/data-coop', adminController.getDataCoopStatus);
router.get('/system-health', adminController.getSystemHealth);

// Mock data management (beta testing)
router.get('/mock-data/status', mockDataController.getMockDataStatus);
router.post('/mock-data/load', mockDataController.loadMockData);
router.post('/mock-data/unload', mockDataController.unloadMockData);

export default router;
