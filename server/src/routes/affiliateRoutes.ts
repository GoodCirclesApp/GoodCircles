import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware';
import {
  getPrograms, createProgram, updateProgram,
  getListings, getAllListings, createListing, updateListing,
  recordClick,
  recordConversion, getConversions, getStats,
} from '../controllers/affiliateController';

const router = Router();

// ── Public — active listings for all marketplace views ────────────────────────
router.get('/listings', getListings);

// ── Authenticated — click tracking (works for all roles including guests with token) ──
router.post('/click/:listingId', authenticateToken, recordClick);

// ── Admin only — program and listing management ───────────────────────────────
const adminOnly = [authenticateToken, authorizeRole(['PLATFORM'])];

router.get('/programs',               ...adminOnly, getPrograms);
router.post('/programs',              ...adminOnly, createProgram);
router.patch('/programs/:id',         ...adminOnly, updateProgram);

router.get('/listings/admin',         ...adminOnly, getAllListings);
router.post('/listings',              ...adminOnly, createListing);
router.patch('/listings/:id',         ...adminOnly, updateListing);

router.post('/conversions',           ...adminOnly, recordConversion);
router.get('/conversions',            ...adminOnly, getConversions);
router.get('/stats',                  ...adminOnly, getStats);

export default router;
