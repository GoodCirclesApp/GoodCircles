import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// Unified search: internal products first, affiliate products last.
// Used by the universal search bar in the marketplace.

export const unifiedSearch = async (req: Request, res: Response) => {
  const { q = '', category, minPrice, maxPrice, page = '1', limit = '24' } = req.query;
  const query = String(q).trim();
  const skip = (Number(page) - 1) * Number(limit);

  try {
    // ── Internal products ────────────────────────────────────────────────────
    const internalWhere: any = { isActive: true };

    if (query) {
      internalWhere.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } },
        { merchant: { businessName: { contains: query, mode: 'insensitive' } } },
      ];
    }

    if (category) internalWhere.category = { contains: String(category), mode: 'insensitive' };
    if (minPrice || maxPrice) {
      internalWhere.price = {};
      if (minPrice) internalWhere.price.gte = Number(minPrice);
      if (maxPrice) internalWhere.price.lte = Number(maxPrice);
    }

    const [internalResults, internalTotal] = await Promise.all([
      prisma.productService.findMany({
        where: internalWhere,
        include: {
          merchant: {
            select: {
              id: true,
              businessName: true,
              isVerified: true,
              regionId: true,
            },
          },
        },
        orderBy: [{ merchant: { isVerified: 'desc' } }, { createdAt: 'desc' }],
        skip,
        take: Number(limit),
      }),
      prisma.productService.count({ where: internalWhere }),
    ]);

    // ── Affiliate products (only when query present) ──────────────────────────
    let affiliateResults: any[] = [];
    let affiliateTotal = 0;

    if (query) {
      const affiliateWhere: any = {
        isActive: true,
        program: { isActive: true },
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } },
        ],
      };

      if (category) {
        affiliateWhere.category = { contains: String(category), mode: 'insensitive' };
        delete affiliateWhere.OR;
        affiliateWhere.AND = [
          {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          },
        ];
      }

      if (minPrice || maxPrice) {
        affiliateWhere.price = {};
        if (minPrice) affiliateWhere.price.gte = Number(minPrice);
        if (maxPrice) affiliateWhere.price.lte = Number(maxPrice);
      }

      [affiliateResults, affiliateTotal] = await Promise.all([
        prisma.affiliateListing.findMany({
          where: affiliateWhere,
          include: {
            program: { select: { name: true, platform: true, logoUrl: true } },
          },
          take: 12,
        }),
        prisma.affiliateListing.count({ where: affiliateWhere }),
      ]);
    }

    res.json({
      query,
      internal: internalResults.map(p => ({
        ...p,
        resultType: 'INTERNAL' as const,
        price: Number(p.price),
        cogs: Number(p.cogs),
      })),
      affiliate: affiliateResults.map(a => ({
        ...a,
        resultType: 'AFFILIATE' as const,
        price: Number(a.price),
      })),
      totals: {
        internal: internalTotal,
        affiliate: affiliateTotal,
        combined: internalTotal + affiliateTotal,
      },
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(internalTotal / Number(limit)),
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
