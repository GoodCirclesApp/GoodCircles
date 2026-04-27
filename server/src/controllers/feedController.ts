import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { prisma } from '../lib/prisma';

export const getFeed = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 30, 100);

    const transactions = await prisma.transaction.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        neighbor: {
          select: { firstName: true, donorProfile: { select: { shareNameWithNonprofits: true } } },
        },
        merchant: { select: { businessName: true, physicalCity: true, physicalState: true } },
        nonprofit: { select: { orgName: true } },
        productService: { select: { name: true, category: true } },
      },
    });

    const feed = transactions.map(tx => {
      const shareIdentity = tx.neighbor.donorProfile?.shareNameWithNonprofits ?? true;
      const neighborLabel = shareIdentity && tx.neighbor.firstName
        ? tx.neighbor.firstName
        : 'A community member';
      const location = tx.merchant.physicalCity
        ? `${tx.merchant.physicalCity}${tx.merchant.physicalState ? ', ' + tx.merchant.physicalState : ''}`
        : null;

      return {
        id: tx.id,
        type: 'PURCHASE',
        neighborLabel,
        merchantName: tx.merchant.businessName,
        productName: tx.productService.name,
        category: tx.productService.category,
        grossAmount: Number(tx.grossAmount),
        nonprofitShare: Number(tx.nonprofitShare),
        nonprofitName: tx.nonprofit.orgName,
        location,
        createdAt: tx.createdAt,
      };
    });

    res.json(feed);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
