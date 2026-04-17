import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { BookingService } from '../services/bookingService';
import { z } from 'zod';

const bookingSchema = z.object({
  listingId: z.string().uuid(),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  scheduledTime: z.string().regex(/^\d{2}:\d{2}$/),
  durationMinutes: z.number().min(15).max(480)
});

export const createBooking = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { listingId, scheduledDate, scheduledTime, durationMinutes } = bookingSchema.parse(req.body);
    const booking = await BookingService.createBooking(listingId, req.user.id, scheduledDate, scheduledTime, durationMinutes);
    res.status(201).json(booking);
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
    res.status(400).json({ error: err.message });
  }
};

export const confirmBooking = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'MERCHANT') return res.status(403).json({ error: 'Only merchants can confirm bookings' });

  try {
    const bookingId = req.params.id as string;
    // We need the merchant's internal ID, not the userId
    // But BookingService.confirmBooking expects merchantId (internal)
    // Let's fetch it or adjust BookingService to take userId
    // Actually, let's fetch it here for clarity
    
    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
    if (!merchant) return res.status(404).json({ error: 'Merchant profile not found' });

    const booking = await BookingService.confirmBooking(bookingId, merchant.id);
    res.json(booking);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const completeBooking = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'MERCHANT') return res.status(403).json({ error: 'Only merchants can complete bookings' });

  try {
    const bookingId = req.params.id as string;
    
    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
    if (!merchant) return res.status(404).json({ error: 'Merchant profile not found' });

    const booking = await BookingService.completeBooking(bookingId, merchant.id);
    res.json(booking);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const bookingId = req.params.id as string;
    const { reason } = z.object({ reason: z.string() }).parse(req.body);
    
    // For merchant, we need to pass their merchant ID if they are a merchant
    // But BookingService.cancelBooking takes userId and role, which works fine
    const booking = await BookingService.cancelBooking(bookingId, req.user.id, req.user.role, reason);
    res.json(booking);
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
    res.status(400).json({ error: err.message });
  }
};

export const processReminders = async (req: AuthRequest, res: Response) => {
  try {
    const count = await BookingService.processReminders();
    res.json({ processed: count });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
