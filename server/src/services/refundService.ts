import { prisma } from '../lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { WalletService } from './walletService';

export class RefundService {
  // Partial refund policy: the nonprofit donation is non-refundable once disbursed.
  // The neighbor receives back: merchantNet + platformFee (= neighborPays - nonprofitShare).
  // The merchant is debited their full net (COGS + profit share).
  // The platform treasury is debited the platform fee.
  // The nonprofit wallet is never touched on refund — they retain the donation and the
  // merchant retains the associated tax deduction incentive.
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

    // The refund amount = what the neighbor paid minus the non-refundable donation.
    // Algebraically equivalent to merchantNet + platformFee.
    const neighborRefundAmount = tx.merchantNet.add(tx.platformFee);

    return prisma.$transaction(async (client) => {
      if (tx.paymentMethod === 'INTERNAL') {
        // 1. Credit neighbor (purchase price less the non-refundable donation)
        await WalletService.fundWallet(
          tx.neighborId,
          neighborRefundAmount.toNumber(),
          `Recapture refund for transaction ${transactionId} (donation non-refundable)`,
          client
        );

        // 2. Debit merchant (their COGS + profit share)
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

        // 3. Debit platform treasury (platform fee returned to neighbor)
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
            description: `Platform fee returned on refund ${transactionId}`,
          },
        });

        // Nonprofit wallet is intentionally NOT debited — donation is final and non-refundable.
      }
      // For STRIPE transactions: record the refund record only.
      // TODO: Stripe partial refund execution deferred to live-testing webhook.

      const refund = await client.transactionRefund.create({
        data: {
          transactionId,
          initiatedBy,
          reason: reason ?? null,
          neighborRefund: neighborRefundAmount,
          merchantDebit: tx.merchantNet,
          nonprofitDebit: new Decimal(0), // Donation is non-refundable
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
