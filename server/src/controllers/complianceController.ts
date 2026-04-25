import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { ComplianceService } from '../services/complianceService';
import { TaxReportingService } from '../services/taxReportingService';
import { IrsVerificationService } from '../services/irsVerificationService';
import { CcvContractService } from '../services/ccvContractService';
import { StateStandingService } from '../services/stateStandingService';
import { z } from 'zod';

// ── IRS Verification ──────────────────────────────────────────────────────────

export const checkNonprofitStatus = async (req: AuthRequest, res: Response) => {
  const ein = req.params.ein as string;
  if (!ein) return res.status(400).json({ error: 'EIN required' });

  const result = await IrsVerificationService.checkNonprofit(ein);
  res.json(result);
};

export const triggerIrsSync = async (req: AuthRequest, res: Response) => {
  const already = await IrsVerificationService.isSyncInProgress();
  if (already) {
    return res.json({ success: false, message: 'Sync already in progress. Check sync logs for status.' });
  }
  // Fire-and-forget — the full IRS BMF download takes 10-30 min
  IrsVerificationService.syncFromIrs().catch(err =>
    console.error('[IRS Sync] Triggered sync error:', err)
  );
  res.json({ success: true, message: 'IRS EO BMF sync started in background. Check sync logs for progress.' });
};

export const getIrsSyncLogs = async (req: AuthRequest, res: Response) => {
  const logs = await IrsVerificationService.getRecentSyncLogs();
  res.json(logs);
};

export const getIrsSyncStatus = async (req: AuthRequest, res: Response) => {
  const status = await IrsVerificationService.getSyncStatus();
  res.json(status);
};

// ── Compliance Dashboard ──────────────────────────────────────────────────────

export const getDeadlines = async (req: AuthRequest, res: Response) => {
  await ComplianceService.seedDeadlines();
  const category = req.query.category as string | undefined;
  const jurisdiction = req.query.jurisdiction as string | undefined;
  const deadlines = await ComplianceService.getDeadlines({ category, jurisdiction });
  res.json(deadlines);
};

export const markDeadlineComplete = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const id = req.params.id as string;
  const { notes } = z.object({ notes: z.string().optional() }).parse(req.body);

  const updated = await ComplianceService.markComplete(id, req.user.id, notes);
  res.json(updated);
};

export const getCcvCampaigns = async (req: AuthRequest, res: Response) => {
  const campaigns = await ComplianceService.getCcvCampaigns();
  res.json(campaigns);
};

export const createCcvCampaign = async (req: AuthRequest, res: Response) => {
  const schema = z.object({
    name: z.string().min(2),
    nonprofitId: z.string().uuid(),
    states: z.array(z.enum(['MS', 'AL', 'LA', 'FL', 'GA', 'CA', 'NY', 'TX', 'WY'])).min(1),
    startDate: z.string().datetime(),
    endDate: z.string().datetime().optional(),
    notes: z.string().optional(),
    donationMechanism: z.enum(['PER_UNIT', 'PERCENTAGE', 'FLAT']).optional(),
    donationAmount: z.number().positive().optional(),
    donationPercentage: z.number().min(0).max(1).optional(),
    transferDeadlineDays: z.number().int().min(1).max(365).optional(),
  });

  try {
    const data = schema.parse(req.body);
    const campaign = await ComplianceService.createCcvCampaign({
      ...data,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    });
    res.status(201).json(campaign);
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
    res.status(500).json({ error: err.message });
  }
};

export const getCampaignLedger = async (req: AuthRequest, res: Response) => {
  try {
    const campaignId = req.params.campaignId as string;
    const ledger = await ComplianceService.getCampaignLedger(campaignId);
    res.json(ledger);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getCt6cfReport = async (req: AuthRequest, res: Response) => {
  try {
    const campaignId = req.params.campaignId as string;
    const report = await ComplianceService.getCt6cfReport(campaignId);
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getCampaignContract = async (req: AuthRequest, res: Response) => {
  try {
    const campaignId = req.params.campaignId as string;
    const contract = await CcvContractService.getContract(campaignId);
    if (!contract) return res.status(404).json({ error: 'Contract not found' });
    res.json(contract);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const signCampaignContract = async (req: AuthRequest, res: Response) => {
  const schema = z.object({
    party: z.enum(['platform', 'nonprofit']),
    signatureToken: z.string().min(1),
  });
  try {
    const campaignId = req.params.campaignId as string;
    const { party, signatureToken } = schema.parse(req.body);
    const contract = await CcvContractService.recordSignature(campaignId, party, signatureToken);
    res.json(contract);
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
    res.status(500).json({ error: err.message });
  }
};

export const getStateStandingStatus = async (req: AuthRequest, res: Response) => {
  try {
    const status = await StateStandingService.getSyncStatus();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const triggerStateStandingSync = async (req: AuthRequest, res: Response) => {
  const state = (req.query.state as string ?? 'CA').toUpperCase();
  if (state !== 'CA') {
    return res.status(400).json({ error: 'Only CA state standing sync is currently supported.' });
  }
  StateStandingService.syncCalifornia().catch(err =>
    console.error('[StateStanding] Triggered sync error:', err)
  );
  res.json({ success: true, message: `${state} AG registry sync started in background.` });
};

export const checkNonprofitStateStanding = async (req: AuthRequest, res: Response) => {
  try {
    const ein = req.params.ein as string;
    const standing = await StateStandingService.checkStanding(ein);
    res.json({ ein, standing });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getMissionReport = async (req: AuthRequest, res: Response) => {
  const report = await ComplianceService.generateQuarterlyMissionReport();
  res.json(report);
};

// ── Tax Reporting ─────────────────────────────────────────────────────────────

export const get1099KReport = async (req: AuthRequest, res: Response) => {
  const year = parseInt(req.query.year as string) || new Date().getFullYear() - 1;
  const data = await TaxReportingService.get1099KReport(year);
  res.json({ taxYear: year, count: data.length, merchants: data });
};

export const export1099KCsv = async (req: AuthRequest, res: Response) => {
  const year = parseInt(req.query.year as string) || new Date().getFullYear() - 1;
  const csv = await TaxReportingService.export1099KCsv(year);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="1099k-${year}.csv"`);
  res.send(csv);
};

export const notify1099KMerchants = async (req: AuthRequest, res: Response) => {
  const year = parseInt(req.query.year as string) || new Date().getFullYear() - 1;
  const result = await TaxReportingService.notify1099KMerchants(year);
  res.json(result);
};

export const getInformActQueue = async (req: AuthRequest, res: Response) => {
  const year = parseInt(req.query.year as string) || new Date().getFullYear();
  const data = await TaxReportingService.getInformActQueue(year);
  res.json({ taxYear: year, count: data.length, merchants: data });
};

export const markInformVerified = async (req: AuthRequest, res: Response) => {
  const merchantId = req.params.merchantId as string;
  const year = parseInt(req.query.year as string) || new Date().getFullYear();
  const result = await TaxReportingService.markInformVerified(merchantId, year);
  res.json(result);
};

export const getStateReport = async (req: AuthRequest, res: Response) => {
  const schema = z.object({
    state: z.enum(['MS', 'AL', 'LA', 'FL', 'GA']),
    startDate: z.string(),
    endDate: z.string(),
  });

  try {
    const { state, startDate, endDate } = schema.parse(req.query);
    const report = await TaxReportingService.getStateReport(
      state,
      new Date(startDate),
      new Date(endDate)
    );
    res.json(report);
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
    res.status(500).json({ error: err.message });
  }
};
