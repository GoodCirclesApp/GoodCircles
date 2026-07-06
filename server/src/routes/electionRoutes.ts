// Meridian early-access election routes (2026-07-06).
// Public routes are rate-limited; admin routes require PLATFORM auth.
// HONESTY RULE: no public route returns counts/rankings — demand data is
// admin-only.
import express from 'express';
import rateLimit from 'express-rate-limit';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware';
import {
  getSeeds,
  submitElection,
  verifyElection,
  nonprofitDemand,
  businessDemand,
  listSuggestions,
  approveSuggestion,
  rejectSuggestion,
  exportDemandCsv,
} from '../controllers/electionController';

const router = express.Router();

// Same shape as the waitlist submitLimiter: 5 submissions/min/IP.
const submitLimiter = rateLimit({
  windowMs: 60_000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts — please wait a minute and try again.' },
});

// Gentler limiter for read/verify traffic.
const readLimiter = rateLimit({
  windowMs: 60_000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

// Public
router.get('/seeds', readLimiter, getSeeds);
router.post('/submit', submitLimiter, submitElection);
router.get('/verify/:token', readLimiter, verifyElection);

// Admin (viewers can read; only PLATFORM can moderate)
router.get('/admin/nonprofit-demand', authenticateToken, authorizeRole(['PLATFORM', 'PLATFORM_VIEWER']), nonprofitDemand);
router.get('/admin/business-demand', authenticateToken, authorizeRole(['PLATFORM', 'PLATFORM_VIEWER']), businessDemand);
router.get('/admin/suggestions', authenticateToken, authorizeRole(['PLATFORM', 'PLATFORM_VIEWER']), listSuggestions);
router.post('/admin/suggestions/:id/approve', authenticateToken, authorizeRole(['PLATFORM']), approveSuggestion);
router.post('/admin/suggestions/:id/reject', authenticateToken, authorizeRole(['PLATFORM']), rejectSuggestion);
router.get('/admin/export', authenticateToken, authorizeRole(['PLATFORM']), exportDemandCsv);

export default router;
