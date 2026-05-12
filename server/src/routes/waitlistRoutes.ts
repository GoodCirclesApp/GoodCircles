import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware';
import * as waitlistController from '../controllers/waitlistController';

const router = Router();

const submitLimiter = rateLimit({
  windowMs: 60_000,
  max: 5,
  message: { error: 'Too many requests. Please try again in a minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', submitLimiter, waitlistController.submitWaitlist);
router.get('/count', waitlistController.getCount);
router.get('/invite/:code', waitlistController.lookupInviteCode);
router.get('/admin/briefings', authenticateToken, authorizeRole(['PLATFORM', 'PLATFORM_VIEWER']), waitlistController.listBriefings);
router.patch('/admin/briefings/:id', authenticateToken, authorizeRole(['PLATFORM']), waitlistController.updateBriefing);
router.delete('/admin/briefings/:id', authenticateToken, authorizeRole(['PLATFORM']), waitlistController.deleteBriefing);
router.post('/admin/resend-confirm', authenticateToken, authorizeRole(['PLATFORM']), waitlistController.resendConfirmEmail);
router.get('/admin', authenticateToken, authorizeRole(['PLATFORM', 'PLATFORM_VIEWER']), waitlistController.listForAdmin);
router.get('/admin/overflow', authenticateToken, authorizeRole(['PLATFORM', 'PLATFORM_VIEWER']), waitlistController.listOverflow);

export default router;
