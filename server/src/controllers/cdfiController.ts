import { Request, Response } from 'express';
import { CDFIService } from '../services/cdfiService';
import { AIUnderwritingService } from '../services/aiUnderwritingService';
import { CdfiPackagingService } from '../services/cdfiPackagingService';
import { FfiecGeocodingService } from '../services/ffiecGeocodingService';

export const getDashboard = async (req: Request, res: Response) => {
  const cdfiId = req.params.id as string; // In a real app, this would come from the authenticated user's CDFI record
  try {
    const dashboard = await CDFIService.getDashboard(cdfiId);
    res.json(dashboard);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getApplications = async (req: Request, res: Response) => {
  const cdfiId = req.params.id as string;
  try {
    const applications = await CDFIService.getApplications(cdfiId);
    res.json(applications);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const evaluateApplication = async (req: Request, res: Response) => {
  const deploymentId = req.params.id as string;
  try {
    const application = await CDFIService.getApplicationById(deploymentId);
    if (!application) return res.status(404).json({ error: 'Application not found' });
    
    const merchantHistory = await CDFIService.getMerchantHistory(application.recipientMerchantId);
    const evaluation = await AIUnderwritingService.evaluateLoanApplication(application, merchantHistory);
    res.json(evaluation);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const approveApplication = async (req: Request, res: Response) => {
  const cdfiId = req.params.cdfiId as string;
  const deploymentId = req.params.id as string;
  const { interestRate, termMonths } = req.body;
  try {
    const deployment = await CDFIService.approveApplication(cdfiId, deploymentId, { interestRate, termMonths });
    res.json(deployment);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const denyApplication = async (req: Request, res: Response) => {
  const cdfiId = req.params.cdfiId as string;
  const deploymentId = req.params.id as string;
  const { reason } = req.body;
  try {
    const deployment = await CDFIService.denyApplication(cdfiId, deploymentId, reason);
    res.json(deployment);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getImpact = async (req: Request, res: Response) => {
  const cdfiId = req.params.id as string;
  try {
    const impact = await CDFIService.getImpactMetrics(cdfiId);
    res.json(impact);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getMerchantPackages = async (req: Request, res: Response) => {
  const cdfiId = req.params.id as string;
  try {
    const packages = await CdfiPackagingService.getPackagesForCdfi(cdfiId);
    res.json(packages);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updatePackageStatus = async (req: Request, res: Response) => {
  const packageId = req.params.packageId as string;
  const { status } = req.body;
  if (!['REVIEWED', 'CONVERTED', 'DECLINED'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Use REVIEWED, CONVERTED, or DECLINED.' });
  }
  try {
    const pkg = await CdfiPackagingService.updatePackageStatus(packageId, status);
    res.json(pkg);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const exportTlrCsv = async (req: Request, res: Response) => {
  const cdfiId = req.params.id as string;
  const taxYear = parseInt(req.query.year as string) || new Date().getFullYear() - 1;
  try {
    const csv = await CdfiPackagingService.generateTlrCsv(cdfiId, taxYear);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="tlr-${cdfiId}-${taxYear}.csv"`);
    res.send(csv);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const geocodeMerchant = async (req: Request, res: Response) => {
  const merchantId = req.params.merchantId as string;
  try {
    const result = await FfiecGeocodingService.geocodeMerchant(merchantId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
