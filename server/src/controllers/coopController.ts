import { Request, Response } from 'express';
import { CooperativeService } from '../services/cooperativeService';
import { z } from 'zod';

export const formCooperative = async (req: Request, res: Response) => {
  const schema = z.object({
    name: z.string().min(3),
    type: z.enum(['PURCHASING', 'MARKETING', 'SHARED_SERVICES']),
    ein: z.string().length(9),
    fiscalYearEnd: z.string().regex(/^\d{2}-\d{2}$/),
    merchantIds: z.array(z.string()).min(3)
  });

  try {
    const data = schema.parse(req.body);
    const coop = await CooperativeService.formCooperative(data);
    res.status(201).json(coop);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const joinCooperative = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { merchantId } = req.body;

  try {
    const membership = await CooperativeService.joinCooperative(id, merchantId);
    res.json(membership);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const calculatePatronage = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { fiscalYear, surplus } = req.body;

  try {
    const records = await CooperativeService.calculatePatronageDividends(id, Number(fiscalYear), Number(surplus));
    res.json(records);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const withdrawMember = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { merchantId } = req.body;

  try {
    const result = await CooperativeService.withdrawMember(id, merchantId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getCoopDetails = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  try {
    const coop = await CooperativeService.getCoopDetails(id);
    if (!coop) return res.status(404).json({ error: 'Cooperative not found' });
    res.json(coop);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
