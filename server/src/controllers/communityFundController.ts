import { Request, Response } from 'express';
import { CommunityFundService } from '../services/communityFundService';

export const getFunds = async (req: Request, res: Response) => {
  const { regionId } = req.query;
  try {
    const funds = await CommunityFundService.getFunds(regionId as string);
    const isPhaseB = await CommunityFundService.isPhaseBActive();
    res.json({ funds, isPhaseB });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const contribute = async (req: Request, res: Response) => {
  const { userId, fundId, amount, source } = req.body;
  try {
    const contribution = await CommunityFundService.contribute(userId, fundId, amount, source);
    res.json(contribution);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const applyForLoan = async (req: Request, res: Response) => {
  const { merchantId, fundId, amount, termMonths } = req.body;
  try {
    const application = await CommunityFundService.applyForLoan(merchantId, fundId, amount, termMonths);
    res.json(application);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getPortfolio = async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  try {
    const portfolio = await CommunityFundService.getConsumerPortfolio(userId);
    res.json(portfolio);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const processRepayment = async (req: Request, res: Response) => {
  const { deploymentId, amount } = req.body;
  try {
    const repayment = await CommunityFundService.processRepayment(deploymentId, amount);
    res.json(repayment);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
