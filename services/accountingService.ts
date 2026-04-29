
import { Order, PayoutBatch, OrderAccounting, Nonprofit } from '../types';

/**
 * Good Circles General Ledger Service
 * Handles high-integrity financial aggregations for the platform.
 */
export const AccountingService = {
  /**
   * Aggregates a list of orders into a financial summary.
   */
  summarizeOrders(orders: Order[]) {
    return orders.reduce((acc, order) => ({
      revenue: acc.revenue + (order.subtotal ?? 0),
      donations: acc.donations + (order.accounting?.donationAmount ?? 0),
      platformFees: acc.platformFees + (order.accounting?.platformFee ?? 0),
      cogs: acc.cogs + (order.accounting?.totalCogs ?? 0),
      net: acc.net + (order.accounting?.merchantNet ?? 0)
    }), { revenue: 0, donations: 0, platformFees: 0, cogs: 0, net: 0 });
  },

  /**
   * Generates a "Payout Batch" for a specific entity (Merchant or Nonprofit).
   * This is used for periodic settlements (e.g., Weekly or Monthly).
   */
  generateBatch(entityId: string, entityName: string, orders: Order[]): PayoutBatch {
    const summary = this.summarizeOrders(orders);
    return {
      id: `BATCH-${Date.now()}-${entityId.slice(0, 4)}`,
      entityId,
      entityName,
      startDate: orders.length > 0 ? orders[0].date : new Date().toISOString(),
      endDate: orders.length > 0 ? orders[orders.length - 1].date : new Date().toISOString(),
      orderIds: orders.map(o => o.id),
      totalGross: summary.revenue,
      totalImpact: summary.donations,
      totalPlatformFees: summary.platformFees,
      netSettlement: summary.net,
      status: 'PENDING'
    };
  },

  /**
   * Safeguard #2: Conflict of Interest Detector.
   * Prevents merchants from donating to nonprofits where they have significant control.
   */
  detectConflict(merchantId: string, nonprofit: Nonprofit): boolean {
    return merchantId === nonprofit.merchantAffiliationId;
  },

  /**
   * Validates that an order's math is consistent across all pillars.
   */
  auditOrderMath(order: Order): boolean {
    const tolerance = 0.01;
    // 10/10/1 model: donation = 10% of net profit (grossProfit), platform fee = 1% of net profit
    const expectedDonation = order.accounting.grossProfit * 0.10;
    const expectedPlatformFee = order.accounting.grossProfit * 0.01;
    return Math.abs(order.accounting.donationAmount - expectedDonation) < tolerance &&
           Math.abs(order.accounting.platformFee - expectedPlatformFee) < tolerance;
  }
};
