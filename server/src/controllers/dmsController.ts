import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/authMiddleware';
import { prisma } from '../lib/prisma';
import { DonorProfileService } from '../services/donorProfileService';
import { ImpactUpdateService } from '../services/impactUpdateService';
import { DmsExportService } from '../services/dmsExportService';
import { CrmWebhookService } from '../services/crmWebhookService';

// ── Helper: resolve nonprofitId from the authenticated NONPROFIT user ─────────

async function resolveNonprofitId(userId: string): Promise<string | null> {
  const np = await prisma.nonprofit.findUnique({ where: { userId }, select: { id: true } });
  return np?.id ?? null;
}

// ══════════════════════════════════════════════════════════════════════════════
// Nonprofit DMS — Dashboard & Donor List
// ══════════════════════════════════════════════════════════════════════════════

export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const nonprofitId = await resolveNonprofitId(req.user!.id);
    if (!nonprofitId) return res.status(403).json({ error: 'Nonprofit account required' });
    const stats = await DmsExportService.getDonorStats(nonprofitId);
    const updates = await ImpactUpdateService.listForNonprofit(nonprofitId, 5);
    res.json({ stats, recentUpdates: updates });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const getDonors = async (req: AuthRequest, res: Response) => {
  try {
    const nonprofitId = await resolveNonprofitId(req.user!.id);
    if (!nonprofitId) return res.status(403).json({ error: 'Nonprofit account required' });
    const page = Math.max(1, parseInt(String(req.query.page ?? 1)));
    const pageSize = Math.min(100, parseInt(String(req.query.pageSize ?? 25)));
    res.json(await DmsExportService.getDonorList(nonprofitId, page, pageSize));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

// ══════════════════════════════════════════════════════════════════════════════
// Impact Updates
// ══════════════════════════════════════════════════════════════════════════════

const updateSchema = z.object({
  title:    z.string().min(3).max(120),
  body:     z.string().min(10).max(2000),
  imageUrl: z.string().url().optional(),
  ctaLabel: z.string().max(60).optional(),
  ctaUrl:   z.string().url().optional(),
});

export const createImpactUpdate = async (req: AuthRequest, res: Response) => {
  try {
    const nonprofitId = await resolveNonprofitId(req.user!.id);
    if (!nonprofitId) return res.status(403).json({ error: 'Nonprofit account required' });
    const data = updateSchema.parse(req.body);
    res.status(201).json(await ImpactUpdateService.create(nonprofitId, data));
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
    res.status(500).json({ error: err.message });
  }
};

export const getImpactUpdates = async (req: AuthRequest, res: Response) => {
  try {
    const nonprofitId = await resolveNonprofitId(req.user!.id);
    if (!nonprofitId) return res.status(403).json({ error: 'Nonprofit account required' });
    res.json(await ImpactUpdateService.listForNonprofit(nonprofitId));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const deleteImpactUpdate = async (req: AuthRequest, res: Response) => {
  try {
    const nonprofitId = await resolveNonprofitId(req.user!.id);
    if (!nonprofitId) return res.status(403).json({ error: 'Nonprofit account required' });
    await ImpactUpdateService.unpublish(String(req.params.id), nonprofitId);
    res.json({ ok: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

// ══════════════════════════════════════════════════════════════════════════════
// Donor Feed (Neighbor-facing)
// ══════════════════════════════════════════════════════════════════════════════

export const getDonorFeed = async (req: AuthRequest, res: Response) => {
  try {
    res.json(await ImpactUpdateService.getDonorFeed(req.user!.id));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

// ══════════════════════════════════════════════════════════════════════════════
// Export Engine
// ══════════════════════════════════════════════════════════════════════════════

const exportSchema = z.object({
  format:   z.enum(['CSV', 'JSON']).default('CSV'),
  dateFrom: z.string().datetime(),
  dateTo:   z.string().datetime(),
});

export const runExport = async (req: AuthRequest, res: Response) => {
  try {
    const nonprofitId = await resolveNonprofitId(req.user!.id);
    if (!nonprofitId) return res.status(403).json({ error: 'Nonprofit account required' });
    const { format, dateFrom, dateTo } = exportSchema.parse(req.body);

    const { rows, format: fmt } = await DmsExportService.runExport(
      nonprofitId, format as 'CSV' | 'JSON',
      new Date(dateFrom), new Date(dateTo),
      req.user!.id
    );

    if (fmt === 'CSV') {
      const csv = DmsExportService.toCsv(rows as any);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="donors-${nonprofitId}-${Date.now()}.csv"`);
      return res.send(csv);
    }
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="donors-${nonprofitId}-${Date.now()}.json"`);
    res.send(JSON.stringify(rows, null, 2));
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
    res.status(500).json({ error: err.message });
  }
};

export const getExportJobs = async (req: AuthRequest, res: Response) => {
  try {
    const nonprofitId = await resolveNonprofitId(req.user!.id);
    if (!nonprofitId) return res.status(403).json({ error: 'Nonprofit account required' });
    res.json(await DmsExportService.getExportJobs(nonprofitId));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

// ══════════════════════════════════════════════════════════════════════════════
// CRM Webhook
// ══════════════════════════════════════════════════════════════════════════════

const webhookSchema = z.object({
  url:    z.string().url(),
  events: z.array(z.enum(['donation.received', 'export.complete', 'milestone.reached'])).min(1),
});

export const saveWebhook = async (req: AuthRequest, res: Response) => {
  try {
    const nonprofitId = await resolveNonprofitId(req.user!.id);
    if (!nonprofitId) return res.status(403).json({ error: 'Nonprofit account required' });
    const { url, events } = webhookSchema.parse(req.body);
    const hook = await CrmWebhookService.save(nonprofitId, url, events);
    // Return config but mask the secret for security
    res.json({ ...hook, secret: `${hook.secret.slice(0, 8)}${'•'.repeat(24)}` });
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
    res.status(500).json({ error: err.message });
  }
};

export const getWebhook = async (req: AuthRequest, res: Response) => {
  try {
    const nonprofitId = await resolveNonprofitId(req.user!.id);
    if (!nonprofitId) return res.status(403).json({ error: 'Nonprofit account required' });
    const hook = await CrmWebhookService.get(nonprofitId);
    if (!hook) return res.json(null);
    res.json({ ...hook, secret: `${hook.secret.slice(0, 8)}${'•'.repeat(24)}` });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

// ══════════════════════════════════════════════════════════════════════════════
// Donor Privacy Settings (Neighbor-facing)
// ══════════════════════════════════════════════════════════════════════════════

export const getDonorPrivacy = async (req: AuthRequest, res: Response) => {
  try {
    res.json(await DonorProfileService.getOrCreate(req.user!.id));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const updateDonorPrivacy = async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      shareNameWithNonprofits:  z.boolean().optional(),
      shareEmailWithNonprofits: z.boolean().optional(),
    });
    const data = schema.parse(req.body);
    res.json(await DonorProfileService.update(req.user!.id, data));
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
    res.status(500).json({ error: err.message });
  }
};
