import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { RefundService } from '../services/refundService';
import { z } from 'zod';
import { AuthRequest } from '../middleware/authMiddleware';
import { Response } from 'express';

const router = Router();
router.use(authenticateToken);

// Initiate a refund (neighbor or admin)
router.post('/:transactionId/refund', async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const { reason } = z.object({ reason: z.string().optional() }).parse(req.body);
    const refund = await RefundService.refundTransaction(
      req.params.transactionId as string,
      req.user.id,
      reason
    );
    res.status(201).json(refund);
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
    res.status(400).json({ error: err.message });
  }
});

// Get refund status for a transaction
router.get('/:transactionId/refund', async (req, res) => {
  try {
    const refund = await RefundService.getRefund(req.params.transactionId as string);
    if (!refund) return res.status(404).json({ error: 'No refund found for this transaction' });
    res.json(refund);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
