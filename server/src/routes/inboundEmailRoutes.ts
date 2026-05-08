import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware';
import * as ctrl from '../controllers/inboundEmailController';

const router = Router();

// Resend posts here when an email arrives — no auth (Resend is the caller)
router.post('/webhook', ctrl.receiveWebhook);

// Admin-only endpoints
router.get('/',         authenticateToken, authorizeRole(['PLATFORM']), ctrl.listEmails);
router.get('/:id',      authenticateToken, authorizeRole(['PLATFORM']), ctrl.getEmail);
router.post('/:id/reply', authenticateToken, authorizeRole(['PLATFORM']), ctrl.replyToEmail);

export default router;
