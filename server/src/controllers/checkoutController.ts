import { Request, Response } from 'express';
import { PricingService, CartItem } from '../services/pricingService';
import { prisma } from '../lib/prisma';
import { z } from 'zod';



export const previewCheckout = async (req: Request, res: Response) => {
  const schema = z.object({
    items: z.array(z.object({
      productServiceId: z.string(),
      quantity: z.number().int().positive()
    })),
    paymentMethod: z.enum(['CARD', 'INTERNAL']),
    discountWaived: z.boolean(),
    creditsToApply: z.number().optional()
  });

  try {
    const { items, paymentMethod, discountWaived, creditsToApply = 0 } = schema.parse(req.body);

    // Fetch user settings for discount mode
    const user = await prisma.user.findUnique({
      where: { id: (req as any).user?.id || '' },
      select: { discountMode: true }
    });
    const discountMode = (user?.discountMode as 'PRICE_REDUCTION' | 'PLATFORM_CREDITS') || 'PRICE_REDUCTION';

    // Fetch product details for pricing
    const productIds = items.map(i => i.productServiceId);
    const products = await prisma.productService.findMany({
      where: { id: { in: productIds } }
    });

    const cartItems: CartItem[] = items.map(item => {
      const p = products.find(prod => prod.id === item.productServiceId);
      if (!p) throw new Error(`Product ${item.productServiceId} not found`);
      return {
        id: p.id,
        name: p.name,
        price: Number(p.price),
        cogs: Number(p.cogs),
        quantity: item.quantity
      };
    });

    const breakdown = PricingService.calculateBreakdown(
      cartItems, 
      paymentMethod, 
      discountWaived, 
      discountMode, 
      creditsToApply
    );
    res.json(breakdown);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.issues });
    }
    res.status(500).json({ error: err.message });
  }
};
