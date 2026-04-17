import { Request, Response } from 'express';
import { SupplyChainService } from '../services/supplyChainService';
import { prisma } from '../lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export const declareRelationship = async (req: Request, res: Response) => {
  const { merchantId, externalSupplierName, productCategory, avgMonthlySpend } = req.body;
  try {
    const rel = await SupplyChainService.declareRelationship(merchantId, {
      externalSupplierName,
      productCategory,
      avgMonthlySpend
    });
    res.json(rel);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getMatches = async (req: Request, res: Response) => {
  const { merchantId } = req.params as { merchantId: string };
  try {
    const matches = await SupplyChainService.getMatches(merchantId);
    res.json(matches);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getStatus = async (req: Request, res: Response) => {
  const { merchantId } = req.params as { merchantId: string };
  try {
    const status = await SupplyChainService.getStatus(merchantId);
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getAdminOverview = async (req: Request, res: Response) => {
  try {
    const overview = await SupplyChainService.getAdminOverview();
    res.json(overview);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const runMatching = async (req: Request, res: Response) => {
  const { merchantId } = req.params as { merchantId: string };
  try {
    await SupplyChainService.runMatchingJob(merchantId);
    res.json({ message: 'Matching job completed' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// When a merchant accepts a supply match, generate COGS suggestions for their
// listings in the same category based on the projected cost savings.
export const acceptMatch = async (req: Request, res: Response) => {
  const { matchId } = req.params as { matchId: string };
  try {
    const match = await prisma.supplyMatch.findUnique({ where: { id: matchId } });
    if (!match) return res.status(404).json({ error: 'Match not found' });
    if (match.status !== 'suggested') return res.status(400).json({ error: 'Match is not in suggested state' });

    await prisma.supplyMatch.update({ where: { id: matchId }, data: { status: 'accepted' } });

    // Find buyer's listings in the same category and suggest COGS reduction
    const listings = await prisma.productService.findMany({
      where: { merchantId: match.buyerMerchantId, category: match.productCategory, isActive: true },
    });

    const savingsPct = match.matchConfidence * 0.15; // heuristic: confidence drives estimated savings up to 15%

    for (const listing of listings) {
      const currentCogs = Number(listing.cogs);
      if (currentCogs <= 0) continue;
      const suggestedCogs = currentCogs * (1 - savingsPct);

      await prisma.cogsSuggestion.upsert({
        where: { id: `${matchId}-${listing.id}` }, // deterministic but won't exist yet
        create: {
          merchantId: match.buyerMerchantId,
          listingId: listing.id,
          supplyMatchId: matchId,
          currentCogs: new Decimal(currentCogs.toFixed(2)),
          suggestedCogs: new Decimal(suggestedCogs.toFixed(2)),
          savingsPct,
        },
        update: {},
      }).catch(async () => {
        // upsert by composite key doesn't work here; just create if not already exists
        const exists = await prisma.cogsSuggestion.findFirst({
          where: { supplyMatchId: matchId, listingId: listing.id },
        });
        if (!exists) {
          await prisma.cogsSuggestion.create({
            data: {
              merchantId: match.buyerMerchantId,
              listingId: listing.id,
              supplyMatchId: matchId,
              currentCogs: new Decimal(currentCogs.toFixed(2)),
              suggestedCogs: new Decimal(suggestedCogs.toFixed(2)),
              savingsPct,
            },
          });
        }
      });
    }

    res.json({ message: 'Match accepted', suggestionsCreated: listings.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
