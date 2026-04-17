import { Request, Response } from 'express';
import { BenefitService } from '../services/benefitService';

export const getPrograms = async (req: Request, res: Response) => {
  try {
    const programs = await BenefitService.getPrograms();
    res.json(programs);
  } catch (err: any) {
    res.status(403).json({ error: err.message });
  }
};

export const enroll = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { merchantId } = req.body;
  try {
    const enrollment = await BenefitService.enroll(merchantId, id);
    res.json(enrollment);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getMerchantBenefits = async (req: Request, res: Response) => {
  const { merchantId } = req.params as { merchantId: string };
  try {
    const benefits = await BenefitService.getMerchantEnrollments(merchantId);
    res.json(benefits);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const stats = await BenefitService.getAdminStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getEligibility = async (req: Request, res: Response) => {
  try {
    const eligibility = await BenefitService.checkActivationStatus();
    res.json(eligibility);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
