
import { CartItem, OrderAccounting, FiscalPolicy, User } from '../types';
import {
  CARD_PROCESSING_FEE,
  INTERNAL_BANKING_FEE
} from '../constants';

// Added getEffectiveRates function to handle category-specific overrides
export const getEffectiveRates = (category: string, policy: FiscalPolicy) => {
  const overrides = policy.categoryOverrides?.[category];
  return {
    discountRate: overrides?.discountRate ?? policy.discountRate,
    donationRate: overrides?.donationRate ?? policy.donationRate,
    platformFeeRate: overrides?.platformFeeRate ?? policy.platformFeeRate
  };
};

export const calculateItemAccounting = (
  productPrice: number,
  category: string,
  quantity: number,
  policy: FiscalPolicy,
  productCogs: number,
  applyDiscount: boolean = true
) => {
  const rates = getEffectiveRates(category, policy);
  // Net profit is based on effective revenue: discounted price in PRICE_REDUCTION mode,
  // full MSRP in PLATFORM_CREDITS mode or when discount is waived.
  const salePrice = applyDiscount ? productPrice * (1 - rates.discountRate) : productPrice;
  const netProfitPerUnit = salePrice - productCogs;
  const totalNetProfit = netProfitPerUnit * quantity;

  const donation = totalNetProfit * rates.donationRate;
  const platformFee = totalNetProfit * rates.platformFeeRate;

  return {
    salePrice,
    totalGrossProfit: totalNetProfit,
    donation,
    platformFee,
    totalCogs: productCogs * quantity
  };
};

export const calculateOrderTotals = (
  cart: CartItem[], 
  paymentMethod: 'CASH' | 'CARD' | 'BALANCE',
  policy: FiscalPolicy,
  isDiscountWaived: boolean = false,
  discountMode: 'PRICE_REDUCTION' | 'PLATFORM_CREDITS' = 'PRICE_REDUCTION',
  appliedCredits: number = 0
) => {
  let totalMsrp = 0;
  let totalDiscount = 0;
  let totalGrossProfit = 0;
  let totalDonation = 0;
  let totalPlatformFee = 0;
  let totalCogs = 0;

  // Discount reduces the profit basis only when applied as a price reduction.
  const applyDiscount = !isDiscountWaived && discountMode !== 'PLATFORM_CREDITS';

  cart.forEach(item => {
    const acc = calculateItemAccounting(
      item.product.price,
      item.product.category,
      item.quantity,
      policy,
      item.product.cogs,
      applyDiscount
    );
    totalMsrp += item.product.price * item.quantity;

    const rates = getEffectiveRates(item.product.category, policy);
    totalDiscount += (item.product.price * rates.discountRate) * item.quantity;

    totalGrossProfit += acc.totalGrossProfit;
    totalDonation += acc.donation;
    totalPlatformFee += acc.platformFee;
    totalCogs += acc.totalCogs;
  });

  // If discount mode is PLATFORM_CREDITS, user pays full price (no immediate discount)
  const effectiveDiscount = (isDiscountWaived || discountMode === 'PLATFORM_CREDITS') ? 0 : totalDiscount;
  const subtotal = totalMsrp - effectiveDiscount;
  const tax = subtotal * policy.taxRate;
  
  const cardFee = paymentMethod === 'CARD' ? subtotal * CARD_PROCESSING_FEE : 0;
  const internalFee = paymentMethod === 'BALANCE' ? subtotal * INTERNAL_BANKING_FEE : 0;

  const feesSaved = paymentMethod === 'CASH' 
    ? subtotal * CARD_PROCESSING_FEE 
    : paymentMethod === 'BALANCE' 
      ? subtotal * (CARD_PROCESSING_FEE - INTERNAL_BANKING_FEE)
      : 0;

  // Total paid is subtotal + tax + fees - applied credits
  const totalPaid = Math.max(0, subtotal + tax + cardFee + internalFee - appliedCredits);

  const accounting: OrderAccounting = {
    grossProfit: totalGrossProfit,
    donationAmount: isDiscountWaived ? totalDonation + totalDiscount : totalDonation,
    platformFee: totalPlatformFee,
    // merchantNet = COGS + 89% of net profit. Using totalCogs + totalGrossProfit * 0.89
    // is correct in all discount modes (PRICE_REDUCTION, PLATFORM_CREDITS, waived) because
    // totalGrossProfit is already computed on the correct effective revenue for each mode.
    merchantNet: totalCogs + totalGrossProfit * 0.89,
    totalCogs: totalCogs,
    feesSaved: feesSaved,
    appliedCredits: appliedCredits,
    waivedDiscountAmount: isDiscountWaived ? totalDiscount : 0
  };

  return {
    totalMsrp,
    totalDiscount: effectiveDiscount,
    subtotal,
    tax,
    cardFee,
    internalFee,
    totalPaid,
    accounting,
    discountMode,
    appliedCredits
  };
};
