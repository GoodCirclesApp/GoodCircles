import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';

// DSAR / data-portability: returns the authenticated user's own data as a JSON
// download. Read-only and self-scoped (always keyed by req.user.id) — never
// returns another user's data, and passwordHash is explicitly excluded by the
// scalar `select`. Account deletion/erasure is a separate, destructive flow that
// must reconcile the CCV/tax retention hold and is intentionally NOT included here.
export const exportMyData = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        discountMode: true,
        electedNonprofitId: true,
        acceptedTermsVersion: true,
        termsAcceptedAt: true,
        // Own role-specific profiles + activity (the user's own data).
        merchant: true,
        nonprofit: true,
        cdfiPartner: true,
        wallet: true,
        transactions: { orderBy: { createdAt: 'desc' }, take: 2000 },
        credits: { take: 2000 },
        consumerBookings: { take: 2000 },
        donorProfile: true,
        walletTopUps: { take: 2000 },
      },
    });

    if (!user) return res.status(404).json({ error: 'Account not found' });

    const payload = {
      exportedAt: new Date().toISOString(),
      notice:
        'This file contains the personal data Good Circles holds for your account. ' +
        'It excludes security credentials (your password is stored only as a one-way hash). ' +
        'To request deletion, email hello@goodcircles.org.',
      account: user,
    };

    const filename = `goodcircles-data-export-${user.id}.json`;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(JSON.stringify(payload, null, 2));
  } catch (err: any) {
    logger.error('[account] data export failed', { requestId: (req as any).id, error: err?.message });
    res.status(500).json({ error: 'Could not generate your data export. Please try again.' });
  }
};
