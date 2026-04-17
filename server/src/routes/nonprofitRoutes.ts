import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import * as nonprofitController from '../controllers/nonprofitController';

const router = Router();

router.get('/referral-code', authenticateToken, nonprofitController.getReferralCode);
router.get('/referrals', authenticateToken, nonprofitController.getReferrals);
router.get('/referrals/:id', authenticateToken, nonprofitController.getReferralDetail);

router.get('/stats', authenticateToken, nonprofitController.getStats);
router.get('/transactions', authenticateToken, nonprofitController.getTransactions);
router.get('/analytics', authenticateToken, nonprofitController.getAnalytics);
router.get('/referral-info', authenticateToken, nonprofitController.getReferralInfo);
router.get('/initiatives', authenticateToken, nonprofitController.getInitiatives);
router.post('/initiatives', authenticateToken, nonprofitController.createInitiative);
router.put('/profile', authenticateToken, nonprofitController.updateProfile);
router.get('/payouts', authenticateToken, nonprofitController.getPayouts);
router.get('/stripe-status', authenticateToken, nonprofitController.getStripeStatus);

// Donation receipts & tax summaries
router.get('/receipts', authenticateToken, nonprofitController.getAnnualReceipts);

// Nonprofit-as-vendor
router.post('/vendor/register', authenticateToken, nonprofitController.registerAsVendor);
router.get('/vendor/listings', authenticateToken, nonprofitController.getNonprofitListings);
router.post('/vendor/listings', authenticateToken, nonprofitController.createNonprofitListing);

export default router;
