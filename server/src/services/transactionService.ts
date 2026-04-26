import { prisma } from '../lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { WalletService } from './walletService';
import { CreditService } from './creditService';
import { ReferralService } from './referralService';
import { createCheckoutSession } from './stripeService';
import { DonationReceiptService } from './donationReceiptService';
import { DonorMilestoneService } from './donorMilestoneService';
import { CrmWebhookService } from './crmWebhookService';
import { TaxReportingService } from './taxReportingService';
import { CdfiPackagingService } from './cdfiPackagingService';



// Extract 2-letter US state abbreviation from a free-text address string
function extractStateFromAddress(address: string): string | null {
  const match = address.match(/\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\b/);
  return match ? match[1] : null;
}

export const calculateDistribution = (
  grossAmount: number,
  cogsAmount: number,
  discountWaived: boolean,
  isInternal: boolean,
  discountMode: 'PRICE_REDUCTION' | 'PLATFORM_CREDITS' = 'PRICE_REDUCTION',
  creditsToApply: number = 0
) => {
  const msrp = new Decimal(grossAmount);
  const cogs = new Decimal(cogsAmount);

  // Consumer Discount (10% of MSRP)
  const discountAmount = msrp.mul(new Decimal(0.10));

  // Effective revenue = actual price received from the sale.
  // In PRICE_REDUCTION mode the discount reduces the sale price directly.
  // In PLATFORM_CREDITS mode or when waived, the neighbor pays full MSRP.
  const applyPriceReduction = !discountWaived && discountMode === 'PRICE_REDUCTION';
  const effectiveRevenue = applyPriceReduction ? msrp.sub(discountAmount) : msrp;

  // Net profit = effective revenue minus cost of goods sold.
  // The 10/10/1 split is applied to net profit, not to gross MSRP profit.
  const netProfit = effectiveRevenue.sub(cogs);
  const nonprofitShare = netProfit.mul(new Decimal(0.10));
  const platformProfitShare = netProfit.mul(new Decimal(0.01));
  const merchantProfitShare = netProfit.mul(new Decimal(0.89));

  // neighborPays = effectiveRevenue before credits are applied.
  // merchantNet = COGS + merchant's 89% profit share (discount already baked into netProfit).
  let neighborPays = effectiveRevenue;
  const merchantNet = cogs.add(merchantProfitShare);

  // Apply credits if any
  const appliedCredits = new Decimal(creditsToApply);
  neighborPays = neighborPays.sub(appliedCredits);
  if (neighborPays.lessThan(0)) neighborPays = new Decimal(0);

  // Internal Processing Fee (0.5% of the amount paid)
  let internalFee = new Decimal(0);
  if (isInternal) {
    internalFee = neighborPays.mul(new Decimal(0.005));
  }

  return {
    msrp,
    cogs,
    profit: netProfit,
    neighborPays,
    neighborDiscount: discountAmount,
    nonprofitShare,
    platformFee: platformProfitShare.add(internalFee),
    merchantNet,
    internalFee,
    appliedCredits
  };
};


interface ProcessTransactionParams {
  neighborId: string;
  merchantId: string;
  productServiceId: string;
  paymentMethod: string;
  nonprofitId: string;
  discountWaived: boolean;
  waivedToInitiativeId?: string;
  waivedToFundId?: string;
  discountMode?: 'PRICE_REDUCTION' | 'PLATFORM_CREDITS';
  creditsToApply?: number;
  amountOverride?: number; // Optional override for cancellation fees, etc.
  bookingId?: string; // Optional booking ID to link
}

export class TransactionService {
  static async processTransaction(params: ProcessTransactionParams) {
    const {
      neighborId,
      merchantId,
      productServiceId,
      paymentMethod,
      nonprofitId,
      discountWaived,
      waivedToInitiativeId,
      waivedToFundId,
      discountMode = 'PRICE_REDUCTION',
      creditsToApply = 0,
      amountOverride,
      bookingId
    } = params;

    const txResult = await prisma.$transaction(async (tx) => {
      // 1. Look up product and verify
      const product = await tx.productService.findUnique({
        where: { id: productServiceId },
        include: { merchant: true }
      });

      if (!product || !product.isActive) {
        throw new Error('Product or service is not available');
      }

      if (product.merchantId !== merchantId) {
        throw new Error('Product does not belong to the specified merchant');
      }

      const nonprofit = await tx.nonprofit.findUnique({
        where: { id: nonprofitId }
      });

      if (!nonprofit) {
        throw new Error('Nonprofit not found');
      }

      // 2. Financial Breakdown (COGS + 89% Profit Model)
      const distribution = calculateDistribution(
        amountOverride !== undefined ? amountOverride : Number(product.price),
        amountOverride !== undefined ? 0 : Number(product.cogs), // Assume 0 COGS for fees
        discountWaived,
        paymentMethod === 'INTERNAL',
        discountMode,
        creditsToApply
      );

      const {
        grossAmount,
        neighborDiscount,
        nonprofitShare,
        platformFee,
        merchantNet,
        neighborPays,
        appliedCredits
      } = {
        grossAmount: distribution.msrp,
        neighborDiscount: distribution.neighborDiscount,
        nonprofitShare: distribution.nonprofitShare,
        platformFee: distribution.platformFee,
        merchantNet: distribution.merchantNet,
        neighborPays: distribution.neighborPays,
        appliedCredits: distribution.appliedCredits
      };

      // 3. Create Transaction Record (with consumer state for CCV audit log)
      const neighborUser = await tx.user.findUnique({
        where: { id: neighborId },
        select: { address: true },
      });
      const consumerState = neighborUser?.address
        ? extractStateFromAddress(neighborUser.address)
        : null;

      const transaction = await tx.transaction.create({
        data: {
          neighborId,
          merchantId,
          productServiceId,
          nonprofitId,
          grossAmount,
          discountAmount: neighborDiscount,
          nonprofitShare,
          platformFee,
          merchantNet,
          paymentMethod,
          discountWaived,
          waivedToInitiativeId: discountWaived ? waivedToInitiativeId : null,
          waivedToFundId: discountWaived ? waivedToFundId : null,
          discountMode,
          appliedCredits,
          consumerState,
        }
      });

      let stripeUrl: string | undefined;

      // 4. Handle Payment Processing
      if (paymentMethod === 'INTERNAL') {
        await WalletService.processInternalTransaction(transaction.id, tx);
      } else if (paymentMethod === 'STRIPE') {
        // TODO: Stripe webhook-based wallet crediting is deferred until live-testing.
        // When live: the webhook handler at POST /api/stripe/webhook should call
        // WalletService.fundWallet for merchant + nonprofit after checkout.session.completed fires.
        // Only create session if neighborPays > 0
        if (neighborPays.greaterThan(0)) {
          if (!product.merchant.stripeAccountId) {
            throw new Error('Merchant is not yet onboarded for Stripe payments');
          }
          if (!nonprofit.stripeAccountId) {
            throw new Error('Nonprofit is not yet onboarded for Stripe payments');
          }

          const session = await createCheckoutSession({
            amount: Math.round(neighborPays.toNumber() * 100), // Stripe expects cents
            currency: 'usd',
            merchantAccountId: product.merchant.stripeAccountId,
            nonprofitAccountId: nonprofit.stripeAccountId,
            metadata: {
              transactionId: transaction.id,
              neighborId,
              bookingId: bookingId || null
            },
            successUrl: `${process.env.APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${process.env.APP_URL}/checkout/cancel`,
          });
          stripeUrl = session.url || undefined;
        } else {
          // If neighbor pays 0 (due to credits), we can mark it as paid immediately
          console.log(`Transaction ${transaction.id} paid in full via credits.`);
        }
      }

      // 4b. Handle Credit Redemption (only when payment is settled immediately)
      if (paymentMethod === 'INTERNAL' || neighborPays.equals(0)) {
        if (appliedCredits.greaterThan(0)) {
          await CreditService.redeemCredits(neighborId, appliedCredits.toNumber(), transaction.id, tx);
        }
        // 4d. Handle Referral Bonuses
        await ReferralService.checkReferralBonuses(merchantId, tx);
      }

      // 4e. Handle Merchant-to-Merchant (M2M) Obligation Tracking
      const consumer = await tx.user.findUnique({ where: { id: neighborId } });
      if (consumer?.role === 'MERCHANT') {
        const consumerMerchant = await tx.merchant.findUnique({ where: { userId: neighborId } });
        if (consumerMerchant) {
          await tx.merchantObligation.create({
            data: {
              debtorMerchantId: consumerMerchant.id,
              creditorMerchantId: merchantId,
              amount: merchantNet,
              transactionId: transaction.id
            }
          });
        }
      }

      // 5. Update Community Initiative or Fund if discount waived
      if (discountWaived) {
        const waivedAmount = neighborDiscount;
        if (waivedToInitiativeId) {
          await tx.communityInitiative.update({
            where: { id: waivedToInitiativeId },
            data: {
              currentFunding: { increment: waivedAmount }
            }
          });
        } else if (waivedToFundId) {
          // Use CommunityFundService logic within the same transaction if possible
          // For simplicity, let's just create the contribution and update the fund directly here
          await tx.fundContribution.create({
            data: {
              userId: neighborId,
              fundId: waivedToFundId,
              amount: waivedAmount,
              source: 'waived_discount'
            }
          });
          await tx.communityFund.update({
            where: { id: waivedToFundId },
            data: {
              totalCapital: { increment: waivedAmount }
            }
          });
        }
      }

      return {
        transaction,
        stripeUrl,
        breakdown: {
          grossAmount,
          neighborDiscount,
          neighborPays,
          nonprofitShare,
          platformFee,
          merchantNet,
          totalNeighborCost: neighborPays
        }
      };
    }) as { transaction: any; stripeUrl: string | undefined; breakdown: any };

    // Post-commit compliance tracking (non-blocking)
    const { transaction: committedTx, breakdown } = txResult;
    TaxReportingService.trackTransaction(
      committedTx.merchantId,
      Number(committedTx.grossAmount)
    ).catch(() => {});
    CdfiPackagingService.evaluateMerchantForPackaging(committedTx.merchantId).catch(() => {});
    if (committedTx.paymentMethod === 'INTERNAL' || breakdown.neighborPays.equals(0)) {
      DonationReceiptService.createForTransaction(committedTx.id).catch(() => {});

      // Non-blocking: check donor milestones and fire CRM webhook
      DonorMilestoneService.checkAndFire(committedTx.neighborId, committedTx.nonprofitId).catch(() => {});
      CrmWebhookService.fire(committedTx.nonprofitId, 'donation.received', {
        transactionId: committedTx.id,
        neighborId: committedTx.neighborId,
        donationAmount: Number(breakdown.nonprofitShare),
      }).catch(() => {});
    }

    return txResult;
  }
}
