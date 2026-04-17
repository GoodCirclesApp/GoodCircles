import { prisma } from '../lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { WalletService } from './walletService';

export class RefundService {
  // Refunds a completed INTERNAL transaction back to the neighbor's wallet.
  // Reverses all wallet movements. For STRIPE transactions, records the refund
  // but does not move Stripe funds (deferred to live-testing webhook).
  static async refundTransaction(transactionId: string, initiatedBy: string, reason?: string) {
    const tx = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        merchant: { include: { user: true } },
        nonprofit: { include: { user: true } },
        refund: true,
      },
    });

    if (!tx) throw new Error('Transaction not found');
    if (tx.refund) throw new Error('Transaction has already been refunded');

    // Recompute what the neighbor originally paid (same formula as walletService)
    const applyPriceReduction =
      !tx.discountWaived && tx.discountMode === 'PRICE_REDUCTION';
    const baseCharge = applyPriceReduction
      ? tx.grossAmount.sub(tx.discountAmount)
      : tx.grossAmount;
    const neighborPays = baseCharge.sub(tx.appliedCredits).lessThan(0)
      ? new Decimal(0)
      : baseCharge.sub(tx.appliedCredits);

    return prisma.$transaction(async (client) => {
      if (tx.paymentMethod === 'INTERNAL') {
        // 1. Credit neighbor back (what they originally paid)
        await WalletService.fundWallet(
          tx.neighborId,
          neighborPays.toNumber(),
          `Refund for transaction ${transactionId}`,
          client
        );

        // 2. Debit merchant (their net earnings)
        const merchantWallet = await WalletService.getOrCreateWallet(tx.merchant.userId, client);
        if (merchantWallet.balance.lt(tx.merchantNet)) {
          throw new Error('Merchant has insufficient balance to process refund');
        }
        const newMerchantBalance = merchantWallet.balance.sub(tx.merchantNet);
        await client.wallet.update({ where: { id: merchantWallet.id }, data: { balance: newMerchantBalance } });
        await client.ledgerEntry.create({
          data: {
            walletId: merchantWallet.id,
            transactionId,
            entryType: 'DEBIT',
            amount: tx.merchantNet,
            balanceAfter: newMerchantBalance,
            description: `Refund reversal for transaction ${transactionId}`,
          },
        });

        // 3. Debit nonprofit
        const nonprofitWallet = await WalletService.getOrCreateWallet(tx.nonprofit.userId, client);
        const safeNonprofitDebit = nonprofitWallet.balance.lt(tx.nonprofitShare)
          ? nonprofitWallet.balance
          : tx.nonprofitShare;
        const newNpBalance = nonprofitWallet.balance.sub(safeNonprofitDebit);
        await client.wallet.update({ where: { id: nonprofitWallet.id }, data: { balance: newNpBalance } });
        await client.ledgerEntry.create({
          data: {
            walletId: nonprofitWallet.id,
            transactionId,
            entryType: 'DEBIT',
            amount: safeNonprofitDebit,
            balanceAfter: newNpBalance,
            description: `Donation reversal for refund ${transactionId}`,
          },
        });

        // 4. Debit platform treasury — decrement balance directly
        const treasuryAfterRefund = await client.platformAccount.upsert({
          where: { id: 'gc-platform-treasury' },
          create: { id: 'gc-platform-treasury', balance: 0, totalRevenue: 0 },
          update: { balance: { decrement: tx.platformFee } },
        });
        await client.platformLedgerEntry.create({
          data: {
            accountId: 'gc-platform-treasury',
            entryType: 'PLATFORM_FEE',
            amount: tx.platformFee.neg(),
            balanceAfter: treasuryAfterRefund.balance,
            transactionId,
            description: `Platform fee reversal for refund ${transactionId}`,
          },
        });
      }
      // For STRIPE transactions: record the refund record only.
      // TODO: Stripe refund execution deferred to live-testing webhook.

      const refund = await client.transactionRefund.create({
        data: {
          transactionId,
          initiatedBy,
          reason: reason ?? null,
          neighborRefund: neighborPays,
          merchantDebit: tx.merchantNet,
          nonprofitDebit: tx.nonprofitShare,
          platformDebit: tx.platformFee,
          refundedToWallet: tx.paymentMethod === 'INTERNAL',
        },
      });

      return refund;
    });
  }

  static async getRefund(transactionId: string) {
    return prisma.transactionRefund.findUnique({ where: { transactionId } });
  }
}
