import { Decimal } from '@prisma/client/runtime/library';
import { calculateDistribution } from './transactionService';

export interface CartItem {
  id: string;
  price: number;
  cogs: number;
  quantity: number;
  name: string;
}

export class PricingService {
  static calculateBreakdown(
    items: CartItem[],
    paymentMethod: 'CARD' | 'INTERNAL',
    discountWaived: boolean,
    discountMode: 'PRICE_REDUCTION' | 'PLATFORM_CREDITS' = 'PRICE_REDUCTION',
    creditsToApply: number = 0
  ) {
    let subtotal = new Decimal(0);
    let discountTotal = new Decimal(0);
    let nonprofitTotal = new Decimal(0);
    let platformFeeTotal = new Decimal(0);
    let merchantNetTotal = new Decimal(0);
    let neighborPaysTotal = new Decimal(0);
    let appliedCreditsTotal = new Decimal(0);

    items.forEach(item => {
      const dist = calculateDistribution(
        item.price * item.quantity,
        item.cogs * item.quantity,
        discountWaived,
        paymentMethod === 'INTERNAL',
        discountMode,
        creditsToApply / items.length // Distribute credits across items for breakdown
      );

      subtotal = subtotal.add(dist.msrp);
      discountTotal = discountTotal.add(dist.neighborDiscount);
      nonprofitTotal = nonprofitTotal.add(dist.nonprofitShare);
      platformFeeTotal = platformFeeTotal.add(dist.platformFee);
      merchantNetTotal = merchantNetTotal.add(dist.merchantNet);
      neighborPaysTotal = neighborPaysTotal.add(dist.neighborPays);
      appliedCreditsTotal = appliedCreditsTotal.add(dist.appliedCredits);
    });

    // Processing Fees
    let processingFeeTotal = new Decimal(0);
    if (paymentMethod === 'CARD') {
      // Stripe fee: 2.9% + $0.30
      processingFeeTotal = neighborPaysTotal.mul(new Decimal(0.029)).add(new Decimal(0.30));
    }

    const consumerTotal = neighborPaysTotal.add(processingFeeTotal);

    // Calculate Savings vs Card
    const cardProcessingFeeIfUsed = neighborPaysTotal.mul(new Decimal(0.029)).add(new Decimal(0.30));
    const savingsVsCard = paymentMethod === 'INTERNAL' ? cardProcessingFeeIfUsed : new Decimal(0);

    return {
      items,
      subtotal,
      discount_total: discountTotal,
      nonprofit_total: nonprofitTotal,
      platform_fee_total: platformFeeTotal,
      processing_fee_total: processingFeeTotal,
      consumer_total: consumerTotal,
      merchant_net_total: merchantNetTotal,
      savings_vs_card: savingsVsCard,
      applied_credits_total: appliedCreditsTotal,
      paymentMethod,
      discountWaived,
      discountMode
    };
  }
}
