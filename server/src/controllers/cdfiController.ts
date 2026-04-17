import { Request, Response } from 'express';
import { CDFIService } from '../services/cdfiService';
import { AIUnderwritingService } from '../services/aiUnderwritingService';

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
