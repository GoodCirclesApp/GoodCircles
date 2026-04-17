import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware';
import * as dms from '../controllers/dmsController';

const router = Router();

const npOnly   = [authenticateToken, authorizeRole(['NONPROFIT'])];
const authOnly = [authenticateToken];

// ── Nonprofit DMS dashboard ────────────────────────────────────────────────
router.get('/dashboard',    ...npOnly, dms.getDashboard);
router.get('/donors',       ...npOnly, dms.getDonors);

// ── Impact Updates (nonprofit posts) ──────────────────────────────────────
router.get('/updates',              ...npOnly,   dms.getImpactUpdates);
router.post('/updates',             ...npOnly,   dms.createImpactUpdate);
router.delete('/updates/:id',       ...npOnly,   dms.deleteImpactUpdate);

// ── Donor feed (neighbor-facing) ────────────────────────────────────────
router.get('/feed',                 ...authOnly, dms.getDonorFeed);

// ── Export engine ────────────────────────────────────────────────────────
router.post('/exports',             ...npOnly, dms.runExport);
router.get('/exports/history',      ...npOnly, dms.getExportJobs);

// ── CRM Webhook ─────────────────────────────────────────────────────────
router.get('/webhook',              ...npOnly, dms.getWebhook);
router.post('/webhook',             ...npOnly, dms.saveWebhook);

// ── Donor privacy settings (neighbor-facing) ───────────────────────────
router.get('/privacy',              ...authOnly, dms.getDonorPrivacy);
router.put('/privacy',              ...authOnly, dms.updateDonorPrivacy);

export default router;
