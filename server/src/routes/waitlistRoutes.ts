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
router.get('/admin', authenticateToken, authorizeRole(['PLATFORM']), waitlistController.listForAdmin);
router.get('/admin/overflow', authenticateToken, authorizeRole(['PLATFORM']), waitlistController.listOverflow);

export default router;
