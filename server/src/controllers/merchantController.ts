import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { z } from 'zod';
import { createConnectAccount, createAccountLink } from '../services/stripeService';
import { AvailabilityService } from '../services/availabilityService';
import { BookingService } from '../services/bookingService';

import { CreditService } from '../services/creditService';
import { PriceSentinelService } from '../services/priceSentinelService';
import { TransactionService } from '../services/transactionService';
import { QrCheckoutService } from '../services/qrCheckoutService';



const merchantProfileSchema = z.object({
  businessName: z.string().min(2).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  creditAcceptance: z.boolean().optional(),
  maxCreditPercentage: z.number().min(0).max(100).optional(),
});

export const getProfile = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const merchant = await prisma.merchant.findUnique({
      where: { userId: req.user.id },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });
    if (!merchant) return res.status(404).json({ error: 'Merchant profile not found' });

    // Check eligibility for credit acceptance
    const eligibility = await CreditService.isMerchantEligible(merchant.id);

    res.json({
      ...merchant,
      isCreditEligible: eligibility.eligible
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const data = merchantProfileSchema.parse(req.body);
    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
    if (!merchant) return res.status(404).json({ error: 'Merchant profile not found' });

    // If trying to enable credit acceptance, check eligibility
    if (data.creditAcceptance === true) {
      const eligibility = await CreditService.isMerchantEligible(merchant.id);
      if (!eligibility.eligible) {
        return res.status(403).json({ error: eligibility.reason || 'Merchant is not yet eligible for credit acceptance (Co-op activation required)' });
      }
    }

    const { creditAcceptance, ...otherData } = data;
    const updateData: any = { ...otherData };
    if (creditAcceptance !== undefined) {
      updateData.creditAcceptance = creditAcceptance ? 'FULL' : 'NONE';
    }

    const updated = await prisma.merchant.update({
      where: { id: merchant.id },
      data: updateData
    });

    res.json(updated);
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
    res.status(500).json({ error: err.message });
  }
};

const MEMBER_DISCOUNT_RATE = 0.10;
const MARGIN_ERROR = 'Price must yield positive margin after the 10% member discount (price × 0.9 must exceed COGS)';
const CLEARANCE_COGS_ERROR = 'Clearance listings must have COGS set to 0 (cost is treated as sunk)';

const listingSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  price: z.number().positive(),
  cogs: z.number().nonnegative().default(0),
  isClearance: z.boolean().optional().default(false),
  type: z.enum(['PRODUCT', 'SERVICE']),
  category: z.string(),
  isActive: z.boolean().optional().default(true),
})
  .refine(
    data => !data.isClearance || data.cogs === 0,
    { message: CLEARANCE_COGS_ERROR, path: ['cogs'] }
  )
  .refine(
    data => data.price * (1 - MEMBER_DISCOUNT_RATE) > data.cogs,
    { message: MARGIN_ERROR, path: ['price'] }
  );

export const createListing = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const data = listingSchema.parse(req.body);
    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
    if (!merchant) return res.status(404).json({ error: 'Merchant profile not found' });

    const listing = await prisma.productService.create({
      data: { ...data, merchantId: merchant.id },
    });

    // Non-blocking price sentinel check
    PriceSentinelService.checkListing(listing.id, data.price, data.category).catch(() => {});

    res.status(201).json(listing);
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
    res.status(500).json({ error: err.message });
  }
};

export const getMyListings = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
    if (!merchant) return res.status(404).json({ error: 'Merchant profile not found' });

    const listings = await prisma.productService.findMany({
      where: { merchantId: merchant.id }
    });
    res.json(listings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateListing = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const id = req.params.id as string;

  try {
    const data = listingSchema.partial().parse(req.body);
    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
    if (!merchant) return res.status(404).json({ error: 'Merchant profile not found' });

    const listing = await prisma.productService.findFirst({
      where: { id, merchantId: merchant.id }
    });
    if (!listing) return res.status(404).json({ error: 'Listing not found or unauthorized' });

    const mergedPrice = data.price ?? Number(listing.price);
    const mergedCogs = data.cogs ?? Number(listing.cogs);
    const mergedIsClearance = data.isClearance ?? listing.isClearance;

    if (mergedIsClearance && mergedCogs !== 0) {
      return res.status(400).json({ error: CLEARANCE_COGS_ERROR });
    }
    if (mergedPrice * (1 - MEMBER_DISCOUNT_RATE) <= mergedCogs) {
      return res.status(400).json({ error: MARGIN_ERROR });
    }

    const updated = await prisma.productService.update({ where: { id }, data });

    // Re-check sentinel whenever price changes
    if (data.price !== undefined || data.category !== undefined) {
      const finalPrice = data.price ?? Number(listing.price);
      const finalCategory = data.category ?? listing.category;
      PriceSentinelService.checkListing(id, finalPrice, finalCategory).catch(() => {});
    }

    res.json(updated);
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
    res.status(500).json({ error: err.message });
  }
};

export const deleteListing = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const id = req.params.id as string;

  try {
    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
    if (!merchant) return res.status(404).json({ error: 'Merchant profile not found' });

    const listing = await prisma.productService.findFirst({
      where: { id, merchantId: merchant.id }
    });
    if (!listing) return res.status(404).json({ error: 'Listing not found or unauthorized' });

    await prisma.productService.update({
      where: { id },
      data: { isActive: false }
    });
    res.json({ message: 'Listing deactivated' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getTransactionHistory = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
    if (!merchant) return res.status(404).json({ error: 'Merchant profile not found' });

    const transactions = await prisma.transaction.findMany({
      where: { merchantId: merchant.id },
      orderBy: { createdAt: 'desc' },
      include: {
        productService: { select: { name: true } },
        nonprofit: { select: { orgName: true } }
      }
    });
    res.json(transactions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getImpactSummary = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
    if (!merchant) return res.status(404).json({ error: 'Merchant profile not found' });

    const aggregates = await prisma.transaction.aggregate({
      where: { merchantId: merchant.id },
      _sum: {
        grossAmount: true,
        nonprofitShare: true,
        platformFee: true,
        merchantNet: true
      },
      _count: { id: true }
    });

    res.json(aggregates);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const setupStripe = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    let merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
    if (!merchant) return res.status(404).json({ error: 'Merchant profile not found' });

    if (!merchant.stripeAccountId) {
      const account = await createConnectAccount(req.user.email, 'merchant');
      merchant = await prisma.merchant.update({
        where: { id: merchant.id },
        data: { stripeAccountId: account.id }
      });
    }

    const accountLink = await createAccountLink(
      merchant.stripeAccountId!,
      `${process.env.APP_URL}/merchant/dashboard?stripe=success`,
      `${process.env.APP_URL}/merchant/dashboard?stripe=refresh`
    );

    res.json({ url: accountLink.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateAvailability = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
    if (!merchant) return res.status(404).json({ error: 'Merchant profile not found' });

    const windows = z.array(z.object({
      dayOfWeek: z.number().min(0).max(6),
      startTime: z.string().regex(/^\d{2}:\d{2}$/),
      endTime: z.string().regex(/^\d{2}:\d{2}$/)
    })).parse(req.body);

    await AvailabilityService.setWeeklyAvailability(merchant.id, windows);
    res.json({ message: 'Availability updated' });
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
    res.status(500).json({ error: err.message });
  }
};

export const addBlock = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
    if (!merchant) return res.status(404).json({ error: 'Merchant profile not found' });

    const { startDate, endDate, reason } = z.object({
      startDate: z.string().datetime(),
      endDate: z.string().datetime(),
      reason: z.string().optional()
    }).parse(req.body);

    const block = await AvailabilityService.addBlock(merchant.id, new Date(startDate), new Date(endDate), reason);
    res.status(201).json(block);
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
    res.status(500).json({ error: err.message });
  }
};

export const getSchedule = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
    if (!merchant) return res.status(404).json({ error: 'Merchant profile not found' });

    const schedule = await BookingService.getMerchantSchedule(merchant.id);
    res.json(schedule);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getDashboardMetrics = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
    if (!merchant) return res.status(404).json({ error: 'Merchant profile not found' });

    const transactions = await prisma.transaction.findMany({
      where: { merchantId: merchant.id }
    });

    const totalSales = transactions.reduce((sum, t) => sum + Number(t.grossAmount), 0);
    const netRevenue = transactions.reduce((sum, t) => sum + Number(t.merchantNet), 0);
    const nonprofitContributions = transactions.reduce((sum, t) => sum + Number(t.nonprofitShare), 0);
    const platformFees = transactions.reduce((sum, t) => sum + Number(t.platformFee), 0);
    
    // Mock processing fees saved (assuming 3% saved via platform)
    const processingFeesSaved = totalSales * 0.03;

    res.json({
      totalSales,
      netRevenue,
      nonprofitContributions,
      platformFees,
      processingFeesSaved,
      transactionCount: transactions.length
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getRevenueChartData = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
    if (!merchant) return res.status(404).json({ error: 'Merchant profile not found' });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const transactions = await prisma.transaction.findMany({
      where: {
        merchantId: merchant.id,
        createdAt: { gte: thirtyDaysAgo }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Group by date
    const chartData = transactions.reduce((acc: any[], t) => {
      const date = t.createdAt.toISOString().split('T')[0];
      const existing = acc.find(d => d.date === date);
      if (existing) {
        existing.revenue += t.merchantNet;
      } else {
        acc.push({ date, revenue: t.merchantNet });
      }
      return acc;
    }, []);

    res.json(chartData);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getFinancialReport = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { startDate, endDate } = req.query;
    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
    if (!merchant) return res.status(404).json({ error: 'Merchant profile not found' });

    const where: any = { merchantId: merchant.id };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        productService: { select: { name: true } },
        nonprofit: { select: { orgName: true } }
      }
    });

    res.json(transactions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getTaxSummary = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
    if (!merchant) return res.status(404).json({ error: 'Merchant profile not found' });
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const { DonationReceiptService } = await import('../services/donationReceiptService');
    const summary = await DonationReceiptService.getMerchantTaxSummary(merchant.id, year);
    res.json(summary);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getBookings = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
    if (!merchant) return res.status(404).json({ error: 'Merchant profile not found' });

    const bookings = await prisma.booking.findMany({
      where: { merchantId: merchant.id },
      include: {
        consumer: { select: { firstName: true, lastName: true, email: true } },
        listing: { select: { name: true } }
      },
      orderBy: { scheduledDate: 'asc' }
    });

    res.json(bookings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  const { status } = z.object({ status: z.enum(['CONFIRMED', 'COMPLETED', 'CANCELLED']) }).parse(req.body);

  try {
    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
    if (!merchant) return res.status(404).json({ error: 'Merchant profile not found' });

    const booking = await prisma.booking.findFirst({
      where: { id: id as string, merchantId: merchant.id }
    });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const updated = await prisma.booking.update({
      where: { id: id as string },
      data: { status }
    });

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getCoopDeals = async (req: AuthRequest, res: Response) => {
  // Mock co-op deals for now
  res.json([
    { id: 'deal-1', name: 'Bulk Coffee Beans', supplier: 'Ethical Beans Co.', discount: '15%', minQuantity: 50, currentCommitted: 30 },
    { id: 'deal-2', name: 'Eco-Friendly Packaging', supplier: 'GreenPack', discount: '20%', minQuantity: 1000, currentCommitted: 450 },
    { id: 'deal-3', name: 'Organic Milk', supplier: 'Local Dairy Coop', discount: '10%', minQuantity: 100, currentCommitted: 85 }
  ]);
};

export const commitToCoopDeal = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { quantity } = z.object({ quantity: z.number().positive() }).parse(req.body);
  res.json({ message: `Committed ${quantity} to deal ${id}`, status: 'SUCCESS' });
};

export const getSupplyChainMatches = async (req: AuthRequest, res: Response) => {
  // Mock supply chain matches
  res.json([
    { id: 'match-1', currentSupplier: 'Sysco', suggestedMatch: 'Local Harvest Collective', potentialSavings: '12%', impactScore: 95 },
    { id: 'match-2', currentSupplier: 'Amazon Business', suggestedMatch: 'Community Office Supply', potentialSavings: '5%', impactScore: 88 }
  ]);
};

export const getBenefitsPrograms = async (req: AuthRequest, res: Response) => {
  // Mock benefits programs
  res.json([
    { id: 'ben-1', name: 'Community Health Plan', coverage: 'Full Medical/Dental', cost: '$450/mo per employee', savings: '25% vs market' },
    { id: 'ben-2', name: 'Co-op Retirement Fund', coverage: '401k with 5% Match', cost: '1% Admin Fee', savings: 'Waived fees' }
  ]);
};

export const enrollInBenefit = async (req: AuthRequest, res: Response) => {
  const { programId } = z.object({ programId: z.string() }).parse(req.body);
  res.json({ message: `Enrolled in ${programId}`, status: 'ENROLLED' });
};

// ── B2B Restocking Order ───────────────────────────────────────────────────────
// Merchant buys from another merchant's listing using their GCLA wallet.
// The buying merchant acts as "neighbor" in the transaction flow.

const b2bOrderSchema = z.object({
  productServiceId: z.string().uuid(),
  nonprofitId: z.string().uuid(),
  discountWaived: z.boolean().default(false),
});

export const placeB2BOrder = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { productServiceId, nonprofitId, discountWaived } = b2bOrderSchema.parse(req.body);

    const product = await prisma.productService.findUnique({
      where: { id: productServiceId },
      include: { merchant: true },
    });
    if (!product || !product.isActive) return res.status(404).json({ error: 'Product not available' });

    const result = await TransactionService.processTransaction({
      neighborId: req.user.id,
      merchantId: product.merchantId,
      productServiceId,
      nonprofitId,
      paymentMethod: 'INTERNAL',
      discountWaived,
    });

    res.status(201).json(result);
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
    res.status(500).json({ error: err.message });
  }
};

// ── QR Checkout (merchant scans consumer token) ────────────────────────────────

const qrCheckoutSchema = z.object({
  qrToken: z.string(),
  productServiceId: z.string().uuid(),
  nonprofitId: z.string().uuid(),
});

export const processQrCheckout = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { qrToken, productServiceId, nonprofitId } = qrCheckoutSchema.parse(req.body);
    const { QrCheckoutService } = await import('../services/qrCheckoutService');

    // Validate the consumer's QR token and retrieve their userId
    const neighborId = await QrCheckoutService.consumeToken(qrToken);

    const product = await prisma.productService.findUnique({
      where: { id: productServiceId },
      include: { merchant: true },
    });
    if (!product || !product.isActive) return res.status(404).json({ error: 'Product not available' });

    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
    if (!merchant || merchant.id !== product.merchantId) {
      return res.status(403).json({ error: 'This product does not belong to your account' });
    }

    const result = await TransactionService.processTransaction({
      neighborId,
      merchantId: product.merchantId,
      productServiceId,
      nonprofitId,
      paymentMethod: 'INTERNAL',
      discountWaived: false,
    });

    res.status(201).json(result);
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
    res.status(500).json({ error: err.message });
  }
};

// ── COGS Suggestions from supply chain matches ────────────────────────────────

export const getCogsSuggestions = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
    if (!merchant) return res.status(404).json({ error: 'Merchant profile not found' });

    const suggestions = await prisma.cogsSuggestion.findMany({
      where: { merchantId: merchant.id, status: 'PENDING' },
      include: {
        listing: { select: { name: true, category: true } },
        supplyMatch: { select: { productCategory: true, potentialSavings: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(suggestions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const respondToCogsSuggestion = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const suggestionId = req.params.id as string;

  try {
    const { action } = z.object({ action: z.enum(['ACCEPTED', 'DISMISSED']) }).parse(req.body);
    const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } });
    if (!merchant) return res.status(404).json({ error: 'Merchant profile not found' });

    const suggestion = await prisma.cogsSuggestion.findFirst({
      where: { id: suggestionId, merchantId: merchant.id },
    });
    if (!suggestion) return res.status(404).json({ error: 'Suggestion not found' });

    const updated = await prisma.cogsSuggestion.update({
      where: { id: suggestionId },
      data: { status: action },
    });

    // If accepted and linked to a specific listing, apply the new COGS
    if (action === 'ACCEPTED' && suggestion.listingId) {
      await prisma.productService.update({
        where: { id: suggestion.listingId },
        data: { cogs: suggestion.suggestedCogs },
      });
    }

    res.json(updated);
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
    res.status(500).json({ error: err.message });
  }
};
