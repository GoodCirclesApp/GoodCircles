import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticateToken, optionalAuthenticateToken, authorizeRole } from '../middleware/authMiddleware';
import {
  getPrograms, createProgram, updateProgram,
  getListings, getAllListings, createListing, updateListing,
  recordClick,
  recordConversion, getConversions, getStats,
  confirmConversion, voidConversion,
} from '../controllers/affiliateController';

const router = Router();

// ── Public — active listings for all marketplace views ────────────────────────
// (Returns [] when AFFILIATE_MARKETPLACE_ENABLED !== 'true' — global kill switch.)
router.get('/listings', getListings);

// ── Click tracking — guests allowed by design (AffiliateClick.userId is
// nullable). Optional auth records userId/userRole when a valid token is
// present; IP rate limit prevents click-spam.
const clickLimiter = rateLimit({
  windowMs: 60_000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many clicks — please slow down.' },
});
router.post('/click/:listingId', clickLimiter, optionalAuthenticateToken, recordClick);

// ── Admin only — program and listing management ───────────────────────────────
const adminOnly = [authenticateToken, authorizeRole(['PLATFORM'])];

router.get('/programs',               ...adminOnly, getPrograms);
router.post('/programs',              ...adminOnly, createProgram);
router.patch('/programs/:id',         ...adminOnly, updateProgram);

router.get('/listings/admin',         ...adminOnly, getAllListings);
router.post('/listings',              ...adminOnly, createListing);
router.patch('/listings/:id',         ...adminOnly, updateListing);

router.post('/conversions',              ...adminOnly, recordConversion);
router.get('/conversions',               ...adminOnly, getConversions);
router.patch('/conversions/:id/confirm', ...adminOnly, confirmConversion);
router.patch('/conversions/:id/void',    ...adminOnly, voidConversion);
router.get('/stats',                     ...adminOnly, getStats);

export default router;
