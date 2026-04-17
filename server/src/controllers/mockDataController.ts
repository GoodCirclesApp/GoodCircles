import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { DEMO_PRODUCT_NAMES } from '../data/demoProducts';

// Toggle demo products on/off and manage demo transactions

export const getMockDataStatus = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'PLATFORM') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  try {
    const activeProducts = await prisma.productService.count({
      where: { name: { in: DEMO_PRODUCT_NAMES }, isActive: true }
    });
    const inactiveProducts = await prisma.productService.count({
      where: { name: { in: DEMO_PRODUCT_NAMES }, isActive: false }
    });
    const demoTransactions = await prisma.transaction.count({
      where: { productService: { name: { in: DEMO_PRODUCT_NAMES } } }
    });
    const totalProducts = await prisma.productService.count({ where: { isActive: true } });
    const totalTransactions = await prisma.transaction.count();

    res.json({
      isLoaded: activeProducts > 0,
      demoProducts: activeProducts + inactiveProducts,
      activeProducts,
      inactiveProducts,
      demoTransactions,
      totalProducts,
      totalTransactions,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const loadMockData = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'PLATFORM') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  try {
    const activated = await prisma.productService.updateMany({
      where: { name: { in: DEMO_PRODUCT_NAMES } },
      data: { isActive: true }
    });

    const existingTxCount = await prisma.transaction.count({
      where: { productService: { name: { in: DEMO_PRODUCT_NAMES } } }
    });

    let createdTransactions = 0;

    if (existingTxCount === 0) {
      const demoProducts = await prisma.productService.findMany({
        where: { name: { in: DEMO_PRODUCT_NAMES } },
        include: { merchant: true }
      });
      const consumers = await prisma.user.findMany({ where: { role: 'NEIGHBOR' } });
      const nonprofits = await prisma.nonprofit.findMany();

      if (demoProducts.length > 0 && consumers.length > 0 && nonprofits.length > 0) {
        const txCount = Math.min(consumers.length * 5, 50);
        for (let i = 0; i < txCount; i++) {
          const consumer = consumers[i % consumers.length];
          const product = demoProducts[Math.floor(Math.random() * demoProducts.length)];
          const nonprofit = nonprofits[Math.floor(Math.random() * nonprofits.length)];
          const grossAmount = Number(product.price);
          const discountAmount = grossAmount * 0.10;
          const platformFee = grossAmount * 0.01;
          const merchantNet = grossAmount - discountAmount - platformFee;
          const nonprofitShare = merchantNet * 0.10;

          try {
            await prisma.transaction.create({
              data: {
                neighborId: consumer.id,
                merchantId: product.merchant.id,
                productServiceId: product.id,
                nonprofitId: nonprofit.id,
                grossAmount,
                discountAmount,
                nonprofitShare,
                platformFee,
                merchantNet,
                paymentMethod: Math.random() > 0.3 ? 'BALANCE' : 'CARD',
                discountMode: 'PRICE_REDUCTION',
                createdAt: randomPastDate(60),
              }
            });
            createdTransactions++;
          } catch (err) { /* skip */ }
        }
      }
    }

    res.json({
      success: true,
      message: 'Demo data activated',
      created: { products: activated.count, transactions: createdTransactions },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const unloadMockData = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'PLATFORM') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  try {
    const deactivated = await prisma.productService.updateMany({
      where: { name: { in: DEMO_PRODUCT_NAMES } },
      data: { isActive: false }
    });

    res.json({
      success: true,
      message: 'Demo data deactivated',
      deleted: { products: deactivated.count, transactions: 0 },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

function randomPastDate(daysBack: number): Date {
  return new Date(Date.now() - Math.random() * daysBack * 86400000);
}
