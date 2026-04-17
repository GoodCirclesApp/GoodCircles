import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { GovernanceService } from '../services/governanceService';
import { z } from 'zod';
import { AuthRequest } from '../middleware/authMiddleware';
import { Response } from 'express';

const router = Router();
router.use(authenticateToken);

// Get or create the global fiscal policy
router.get('/policy', async (req, res) => {
  try {
    const regionId = req.query.regionId as string | undefined;
    const policy = await GovernanceService.getPolicy(regionId);
    res.json(policy);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// List proposals
router.get('/proposals', async (req, res) => {
  try {
    const policyId = req.query.policyId as string | undefined;
    const status = req.query.status as string | undefined;
    res.json(await GovernanceService.getProposals(policyId, status));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Create a proposal
router.post('/proposals', async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const schema = z.object({
      policyId: z.string().uuid(),
      title: z.string().min(5),
      description: z.string().min(10),
      proposedChanges: z.record(z.string(), z.unknown()),
      stakeAmount: z.number().nonnegative().default(0),
    });
    const data = schema.parse(req.body);
    const proposal = await GovernanceService.createProposal(
      req.user.id,
      data.policyId,
      data.title,
      data.description,
      data.proposedChanges as Record<string, unknown>,
      data.stakeAmount
    );
    res.status(201).json(proposal);
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
    res.status(500).json({ error: err.message });
  }
});

// Cast a vote
router.post('/proposals/:id/vote', async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const { inFavor } = z.object({ inFavor: z.boolean() }).parse(req.body);
    const result = await GovernanceService.castVoteByUser(req.params.id as string, req.user.id, inFavor);
    res.json(result);
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
    res.status(400).json({ error: err.message });
  }
});

export default router;
