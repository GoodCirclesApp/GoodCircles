import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { TransactionService } from '../services/transactionService';
import { AvailabilityService } from '../services/availabilityService';
import { AuthRequest } from '../middleware/authMiddleware';

// Category-based placeholder images using picsum.photos (free, no API key needed)
const CATEGORY_IMAGES: Record<string, string[]> = {
  'Dining': [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=400&fit=crop',
  ],
  'Home Services': [
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&h=400&fit=crop',
  ],
  'Home Maintenance': [
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=400&fit=crop',
  ],
  'Professional Services': [
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=400&h=400&fit=crop',
  ],
  'Groceries': [
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1506484381205-f7945b8a832e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1543168256-418811576931?w=400&h=400&fit=crop',
  ],
  'Groceries & Staples': [
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1506484381205-f7945b8a832e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop',
  ],
  'Education': [
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=400&fit=crop',
  ],
  'Home & Garden': [
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400&h=400&fit=crop',
  ],
  'Gifts': [
    'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=400&fit=crop',
  ],
  'Activities': [
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=400&h=400&fit=crop',
  ],
  'Health & Wellness': [
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
  ],
};

const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop',
];

function getImageForProduct(category: string, index: number): string {
  const images = CATEGORY_IMAGES[category] || DEFAULT_IMAGES;
  return images[index % images.length];
}

export const searchMarketplace = async (req: Request, res: Response) => {
  const { q, type, category, price_min, price_max, sort, region, page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  try {
    const where: any = { isActive: true };

    if (q) {
      const searchTerm = String(q);
      where.OR = [
        { name: { contains: searchTerm } },
        { description: { contains: searchTerm } },
        { category: { contains: searchTerm } },
        { merchant: { businessName: { contains: searchTerm } } }
      ];
    }

    if (type) where.type = String(type);
    if (category) where.category = String(category);
    if (region) where.merchant = { ...where.merchant, regionId: String(region) };

    if (price_min || price_max) {
      where.price = {};
      if (price_min) where.price.gte = Number(price_min);
      if (price_max) where.price.lte = Number(price_max);
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };
    else if (sort === 'name_asc') orderBy = { name: 'asc' };
    else if (sort === 'newest') orderBy = { createdAt: 'desc' };

    const [listings, total] = await Promise.all([
      prisma.productService.findMany({
        where,
        include: {
          merchant: {
            select: {
              id: true,
              businessName: true,
              isVerified: true,
              regionId: true,
              latitude: true,
              longitude: true,
            }
          }
        },
        skip,
        take: Number(limit),
        orderBy
      }),
      prisma.productService.count({ where })
    ]);

    // Flatten merchant data and add image URLs to match frontend Product interface
    const enrichedListings = listings.map((listing, index) => {
      const price = Number(listing.price);
      const discountAmount = price * 0.10;
      const memberPrice = price - discountAmount;
      const cogs = Number(listing.cogs);
      const netProfit = price - cogs;
      const nonprofitShare = netProfit * 0.10;

      return {
        id: listing.id,
        name: listing.name,
        description: listing.description || '',
        price,
        cogs,
        type: listing.type,
        category: listing.category,
        isActive: listing.isActive,
        createdAt: listing.createdAt,
        merchantId: listing.merchantId,
        merchantName: listing.merchant?.businessName || 'Local Merchant',
        imageUrl: getImageForProduct(listing.category, index),
        regionId: listing.merchant?.regionId || undefined,
        latitude: listing.merchant?.latitude ? Number(listing.merchant.latitude) : undefined,
        longitude: listing.merchant?.longitude ? Number(listing.merchant.longitude) : undefined,
        merchant: listing.merchant,
        projectedSavings: {
          originalPrice: price,
          discountAmount: Math.round(discountAmount * 100) / 100,
          memberPrice: Math.round(memberPrice * 100) / 100,
          nonprofitContribution: Math.round(nonprofitShare * 100) / 100,
        }
      };
    });

    res.json({
      listings: enrichedListings,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.productService.findMany({
      select: { category: true },
      distinct: ['category']
    });
    res.json(categories.map(c => c.category));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const listOrders = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  try {
    const orders = await prisma.transaction.findMany({
      where: { neighborId: req.user.id },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        merchant: true,
        nonprofit: true,
        productService: true,
      }
    });
    const total = await prisma.transaction.count({ where: { neighborId: req.user.id } });
    res.json({ orders, total });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getListingDetail = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const listing = await prisma.productService.findUnique({
      where: { id: id as string },
      include: {
        merchant: {
          select: {
            id: true,
            businessName: true,
            isVerified: true,
            regionId: true,
            latitude: true,
            longitude: true,
          }
        }
      }
    });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    const price = Number(listing.price);
    const cogs = Number(listing.cogs);
    const discountAmount = price * 0.10;
    const memberPrice = price - discountAmount;
    const netProfit = price - cogs;
    const nonprofitShare = netProfit * 0.10;
    const platformFee = netProfit * 0.01;
    const merchantNet = price - discountAmount - nonprofitShare - platformFee;
    const cardProcessingFee = memberPrice * 0.029 + 0.30;
    const internalProcessingFee = memberPrice * 0.005;

    res.json({
      ...listing,
      merchantName: listing.merchant?.businessName || 'Local Merchant',
      imageUrl: getImageForProduct(listing.category, 0),
      priceBreakdown: {
        originalPrice: price,
        yourDiscount: Math.round(discountAmount * 100) / 100,
        toYourNonprofit: Math.round(nonprofitShare * 100) / 100,
        platformFee: Math.round(platformFee * 100) / 100,
        youPay: Math.round(memberPrice * 100) / 100,
        payWithCard: {
          processingFee: Math.round(cardProcessingFee * 100) / 100,
          total: Math.round((memberPrice + cardProcessingFee) * 100) / 100,
        },
        payWithBalance: {
          processingFee: Math.round(internalProcessingFee * 100) / 100,
          total: Math.round((memberPrice + internalProcessingFee) * 100) / 100,
        },
        savingsWithBalance: Math.round((cardProcessingFee - internalProcessingFee) * 100) / 100,
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getAvailability = async (req: Request, res: Response) => {
  const { id } = req.params;
  const date = req.query.date;

  if (typeof date !== 'string') {
    return res.status(400).json({ error: 'Date query parameter is required (YYYY-MM-DD)' });
  }

  try {
    const listingId: string = id as string;
    const dateStr: string = date as string;
    const slots = await AvailabilityService.getAvailableSlots(listingId, dateStr);
    res.json({ date: dateStr, slots });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const checkout = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { items, paymentMethod: rawPaymentMethod, discountWaived, waivedToInitiativeId, creditsToApply = 0 } = req.body;

  // Frontend uses 'BALANCE'; backend TransactionService expects 'INTERNAL'
  const paymentMethod = rawPaymentMethod === 'BALANCE' ? 'INTERNAL' : rawPaymentMethod;

  try {
    const results = [];
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const defaultNonprofitId = user?.electedNonprofitId;
    const discountMode = user?.discountMode as 'PRICE_REDUCTION' | 'PLATFORM_CREDITS' || 'PRICE_REDUCTION';
    let remainingCredits = creditsToApply;

    for (const item of items) {
      const creditsForItem = remainingCredits;
      remainingCredits = 0;

      const result = await TransactionService.processTransaction({
        neighborId: req.user.id,
        merchantId: item.merchantId,
        productServiceId: item.productServiceId,
        paymentMethod,
        nonprofitId: item.nonprofitId || defaultNonprofitId,
        discountWaived: discountWaived || false,
        waivedToInitiativeId,
        discountMode,
        creditsToApply: creditsForItem
      });
      results.push(result);
    }

    res.status(201).json({
      message: 'Checkout successful',
      orders: results
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
