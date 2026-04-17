import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

const CONVERSION_FEE_RATE = new Decimal('0.035');
const PLATFORM_TREASURY_ID = 'gc-platform-treasury';

export class WalletService {
  static async getOrCreateWallet(userId: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    let wallet = await client.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      wallet = await client.wallet.create({ data: { userId, balance: new Decimal(0) } });
    }
    return wallet;
  }

  // Credits an amount to the platform treasury singleton and records a ledger entry.
  static async creditPlatformTreasury(
    amount: Decimal,
    entryType: 'PLATFORM_FEE' | 'INTERNAL_FEE' | 'CONVERSION_FEE',
    description: string,
    transactionId: string | null,
    client: Prisma.TransactionClient
  ) {
    const account = await client.platformAccount.upsert({
      where: { id: PLATFORM_TREASURY_ID },
      create: { id: PLATFORM_TREASURY_ID, balance: amount, totalRevenue: amount },
      update: {
        balance: { increment: amount },
        totalRevenue: { increment: amount },
      },
    });
    // account.balance IS the post-upsert value (Prisma returns the updated row).
    // Do NOT add amount again — that would double-count.
    const balanceAfter = account.balance;
    await client.platformLedgerEntry.create({
      data: {
        accountId: PLATFORM_TREASURY_ID,
        entryType,
        amount,
        balanceAfter,
        transactionId: transactionId ?? undefined,
        description,
      },
    });
    return account;
  }

  static async fundWallet(userId: string, amount: number, description: string = 'Wallet funding', tx?: Prisma.TransactionClient) {
    const execute = async (client: Prisma.TransactionClient) => {
      const wallet = await this.getOrCreateWallet(userId, client);
      const newBalance = wallet.balance.add(new Decimal(amount));
      const updatedWallet = await client.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance },
      });
      await client.ledgerEntry.create({
        data: {
          walletId: wallet.id,
          entryType: 'CREDIT',
          amount: new Decimal(amount),
          balanceAfter: newBalance,
          description,
        },
      });
      return updatedWallet;
    };
    if (tx) return await execute(tx);
    return await prisma.$transaction(async (client) => await execute(client));
  }

  static async processInternalTransaction(transactionId: string, tx?: Prisma.TransactionClient) {
    const execute = async (client: Prisma.TransactionClient) => {
      const transaction = await client.transaction.findUnique({
        where: { id: transactionId },
        include: {
          neighbor: true,
          merchant: { include: { user: true } },
          nonprofit: { include: { user: true } },
        },
      });
      if (!transaction) throw new Error('Transaction not found');
      if (transaction.paymentMethod !== 'INTERNAL') throw new Error('Not an internal transaction');

      // Recompute neighborPays from stored transaction fields.
      // Matches calculateDistribution in transactionService.ts.
      const applyPriceReduction =
        !transaction.discountWaived && transaction.discountMode === 'PRICE_REDUCTION';
      const baseCharge = applyPriceReduction
        ? transaction.grossAmount.sub(transaction.discountAmount)
        : transaction.grossAmount;
      const neighborPays = baseCharge.sub(transaction.appliedCredits).lessThan(0)
        ? new Decimal(0)
        : baseCharge.sub(transaction.appliedCredits);

      // 1. Debit Neighbor (neighborPays, not MSRP)
      const neighborWallet = await this.getOrCreateWallet(transaction.neighborId, client);
      if (neighborWallet.balance.lt(neighborPays)) {
        throw new Error('Insufficient wallet balance');
      }
      const neighborNewBalance = neighborWallet.balance.sub(neighborPays);
      await client.wallet.update({ where: { id: neighborWallet.id }, data: { balance: neighborNewBalance } });
      await client.ledgerEntry.create({
        data: {
          walletId: neighborWallet.id,
          transactionId: transaction.id,
          entryType: 'DEBIT',
          amount: neighborPays,
          balanceAfter: neighborNewBalance,
          description: `Purchase from ${transaction.merchant.businessName}`,
        },
      });

      // 2. Credit Merchant
      const merchantWallet = await this.getOrCreateWallet(transaction.merchant.userId, client);
      const merchantNewBalance = merchantWallet.balance.add(transaction.merchantNet);
      await client.wallet.update({ where: { id: merchantWallet.id }, data: { balance: merchantNewBalance } });
      await client.ledgerEntry.create({
        data: {
          walletId: merchantWallet.id,
          transactionId: transaction.id,
          entryType: 'CREDIT',
          amount: transaction.merchantNet,
          balanceAfter: merchantNewBalance,
          description: `Sale to ${transaction.neighbor.firstName || 'Neighbor'}`,
        },
      });

      // 3. Credit Nonprofit
      const nonprofitWallet = await this.getOrCreateWallet(transaction.nonprofit.userId, client);
      const nonprofitNewBalance = nonprofitWallet.balance.add(transaction.nonprofitShare);
      await client.wallet.update({ where: { id: nonprofitWallet.id }, data: { balance: nonprofitNewBalance } });
      await client.ledgerEntry.create({
        data: {
          walletId: nonprofitWallet.id,
          transactionId: transaction.id,
          entryType: 'CREDIT',
          amount: transaction.nonprofitShare,
          balanceAfter: nonprofitNewBalance,
          description: `Donation from transaction ${transaction.id}`,
        },
      });

      // 4. Credit Platform Treasury (deterministic singleton — never an arbitrary admin user)
      await this.creditPlatformTreasury(
        transaction.platformFee,
        'PLATFORM_FEE',
        `Platform fee from transaction ${transaction.id}`,
        transaction.id,
        client
      );

      return transaction;
    };
    if (tx) return await execute(tx);
    return await prisma.$transaction(async (client) => await execute(client));
  }

  // Withdraws funds, applying the 3.5% conversion fee on top of the requested amount.
  static async withdraw(userId: string, amount: number, description: string = 'Wallet withdrawal', tx?: Prisma.TransactionClient) {
    const execute = async (client: Prisma.TransactionClient) => {
      const wallet = await this.getOrCreateWallet(userId, client);
      const withdrawalAmount = new Decimal(amount);
      const conversionFee = withdrawalAmount.mul(CONVERSION_FEE_RATE);
      const totalDebit = withdrawalAmount.add(conversionFee);

      if (wallet.balance.lt(totalDebit)) {
        throw new Error(
          `Insufficient balance for withdrawal. Required: ${totalDebit.toFixed(2)} (${amount} + 3.5% fee ${conversionFee.toFixed(2)})`
        );
      }

      const newBalance = wallet.balance.sub(totalDebit);
      const updatedWallet = await client.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance },
      });
      await client.ledgerEntry.create({
        data: {
          walletId: wallet.id,
          entryType: 'DEBIT',
          amount: totalDebit,
          balanceAfter: newBalance,
          description: `${description} (includes 3.5% conversion fee)`,
        },
      });

      await this.creditPlatformTreasury(
        conversionFee,
        'CONVERSION_FEE',
        `Conversion fee on withdrawal by user ${userId}`,
        null,
        client
      );

      return { wallet: updatedWallet, withdrawalAmount, conversionFee, totalDebit };
    };
    if (tx) return await execute(tx);
    return await prisma.$transaction(async (client) => await execute(client));
  }

  static async getBalance(userId: string): Promise<number> {
    const wallet = await this.getOrCreateWallet(userId);
    return parseFloat(wallet.balance.toString());
  }

  static async getHistory(userId: string, page: number = 1, limit: number = 20) {
    const wallet = await this.getOrCreateWallet(userId);
    const entries = await prisma.ledgerEntry.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { transaction: true },
    });
    const total = await prisma.ledgerEntry.count({ where: { walletId: wallet.id } });
    return {
      entries,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  static async getCreditBalance(userId: string): Promise<number> {
    try {
      const credits = await prisma.creditLedger.findMany({ where: { userId } });
      return parseFloat(
        credits
          .reduce((acc, curr) => {
            if (curr.entryType === 'CREDIT') return acc.add(curr.amount);
            return acc.sub(curr.amount);
          }, new Decimal(0))
          .toString()
      );
    } catch {
      return 0;
    }
  }
}
