import { Request, Response } from 'express';
import { z } from 'zod';
import { AffiliateService } from '../services/affiliateService';
import { AuthRequest } from '../middleware/authMiddleware';

// ── Programs ──────────────────────────────────────────────────────────────────

const programSchema = z.object({
  name:         z.string().min(2),
  platform:     z.string().min(1),
  trackingId:   z.string().min(1),
  baseCommRate: z.number().min(0).max(1).default(0.04),
  logoUrl:      z.string().url().optional(),
});

export const getPrograms = async (req: AuthRequest, res: Response) => {
  try {
    const includeInactive = req.query.all === 'true';
    res.json(await AffiliateService.getPrograms(includeInactive));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const createProgram = async (req: AuthRequest, res: Response) => {
  try {
    const data = programSchema.parse(req.body);
    res.status(201).json(await AffiliateService.createProgram(data));
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
    res.status(500).json({ error: err.message });
  }
};

export const updateProgram = async (req: AuthRequest, res: Response) => {
  try {
    const data = programSchema.partial().parse(req.body);
    res.json(await AffiliateService.updateProgram(String(req.params.id), data));
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
    res.status(500).json({ error: err.message });
  }
};

// ── Listings ──────────────────────────────────────────────────────────────────

const listingSchema = z.object({
  programId:    z.string().uuid(),
  externalId:   z.string().optional(),
  title:        z.string().min(3),
  description:  z.string().optional(),
  imageUrl:     z.string().url().optional(),
  price:        z.number().positive(),
  affiliateUrl: z.string().url(),
  category:     z.string().min(1),
  commRate:     z.number().min(0).max(1).optional(),
});

export const getListings = async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const excludeRaw = req.query.excludeCategories as string | undefined;
    const excludeCategories = excludeRaw
      ? excludeRaw.split(',').map(s => s.trim()).filter(Boolean)
      : [];
    res.json(await AffiliateService.getActiveListings(category, excludeCategories));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const getAllListings = async (req: AuthRequest, res: Response) => {
  try {
    res.json(await AffiliateService.getAllListings());
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const createListing = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const data = listingSchema.parse(req.body);
    res.status(201).json(await AffiliateService.createListing({ ...data, createdBy: req.user.id }));
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
    res.status(500).json({ error: err.message });
  }
};

export const updateListing = async (req: AuthRequest, res: Response) => {
  try {
    const data = listingSchema.partial().parse(req.body);
    res.json(await AffiliateService.updateListing(String(req.params.id), data));
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
    res.status(500).json({ error: err.message });
  }
};

// ── Click tracking ─────────────────────────────────────────────────────────────

export const recordClick = async (req: AuthRequest, res: Response) => {
  try {
    const result = await AffiliateService.recordClick(
      String(req.params.listingId),
      req.user?.id,
      req.user?.role,
    );
    res.json(result);
  } catch (err: any) { res.status(404).json({ error: err.message }); }
};

// ── Conversions ────────────────────────────────────────────────────────────────

const conversionSchema = z.object({
  listingId:   z.string().uuid(),
  clickId:     z.string().uuid().optional(),
  saleAmount:  z.number().positive(),
  externalRef: z.string().optional(),
});

export const recordConversion = async (req: AuthRequest, res: Response) => {
  try {
    const data = conversionSchema.parse(req.body);
    res.status(201).json(await AffiliateService.recordConversion(data));
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
    res.status(500).json({ error: err.message });
  }
};

export const getConversions = async (req: AuthRequest, res: Response) => {
  try {
    res.json(await AffiliateService.getConversions());
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    res.json(await AffiliateService.getStats());
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};
