import { Router } from 'express';
import * as merchantController from '../controllers/merchantController';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware';
import { requireVerified } from '../middleware/verifyMiddleware';

const router = Router();

// All routes require MERCHANT role
router.use(authenticateToken);
router.use(authorizeRole(['MERCHANT']));

router.get('/profile', merchantController.getProfile);
router.put('/profile', merchantController.updateProfile);

router.get('/listings', merchantController.getMyListings);
router.post('/listings', requireVerified, merchantController.createListing);
router.put('/listings/:id', requireVerified, merchantController.updateListing);
router.delete('/listings/:id', requireVerified, merchantController.deleteListing);

router.get('/transactions', merchantController.getTransactionHistory);
router.get('/impact', merchantController.getImpactSummary);
router.get('/dashboard/metrics', merchantController.getDashboardMetrics);
router.get('/dashboard/revenue-chart', merchantController.getRevenueChartData);
router.get('/reports/financial', merchantController.getFinancialReport);
router.get('/reports/tax-summary', merchantController.getTaxSummary);
router.get('/bookings', merchantController.getBookings);
router.put('/bookings/:id/status', merchantController.updateBookingStatus);
router.get('/coop/deals', merchantController.getCoopDeals);
router.post('/coop/deals/:id/commit', merchantController.commitToCoopDeal);
router.get('/supply-chain/matches', merchantController.getSupplyChainMatches);
router.get('/benefits/programs', merchantController.getBenefitsPrograms);
router.post('/benefits/enroll', merchantController.enrollInBenefit);
router.post('/stripe-setup', merchantController.setupStripe);

router.put('/availability', merchantController.updateAvailability);
router.post('/availability/blocks', merchantController.addBlock);
router.get('/schedule', merchantController.getSchedule);

// B2B restocking
router.post('/b2b/order', merchantController.placeB2BOrder);

// In-person QR checkout
router.post('/qr-checkout', merchantController.processQrCheckout);

// COGS suggestions from supply chain
router.get('/cogs-suggestions', merchantController.getCogsSuggestions);
router.put('/cogs-suggestions/:id', merchantController.respondToCogsSuggestion);

export default router;
