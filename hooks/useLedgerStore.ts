
import { useState, useEffect, useMemo } from 'react';
import { Order, PayoutBatch, TreasuryStats, DisputeStatus } from '../types';
import { AccountingService } from '../services/accountingService';

export function useLedgerStore() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [batches, setBatches] = useState<PayoutBatch[]>([]);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Clean launch: the ledger starts EMPTY — no fabricated transaction history.
    // One-time purge of the legacy MOCK_ORDERS seed (and its batches) that earlier
    // builds wrote into localStorage, so returning sessions also start clean.
    const LEDGER_SEED = 'clean-v1';
    if (localStorage.getItem('gc_orders_seed') !== LEDGER_SEED) {
      localStorage.removeItem('gc_orders');
      localStorage.removeItem('gc_batches');
      localStorage.setItem('gc_orders_seed', LEDGER_SEED);
    }

    const savedOrders = localStorage.getItem('gc_orders');
    if (savedOrders) setOrders(JSON.parse(savedOrders));

    const savedBatches = localStorage.getItem('gc_batches');
    if (savedBatches) setBatches(JSON.parse(savedBatches));
  }, []);

  const updateOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    localStorage.setItem('gc_orders', JSON.stringify(newOrders));
    
    // Auto-batching simplified
    const unbatched = newOrders.filter(o => !o.batchId && o.handshakeStatus === 'COMPLETED');
    if (unbatched.length >= 10) {
      const newBatch = AccountingService.generateBatch('platform-global', 'Network Wide Settlement', unbatched);
      const updatedBatches = [...batches, newBatch];
      const batchedOrders = newOrders.map(o => unbatched.some(u => u.id === o.id) ? { ...o, batchId: newBatch.id } : o);
      setBatches(updatedBatches);
      setOrders(batchedOrders);
      localStorage.setItem('gc_batches', JSON.stringify(updatedBatches));
      localStorage.setItem('gc_orders', JSON.stringify(batchedOrders));
    }
  };

  const resolveDispute = (orderId: string, status: 'RESOLVED' | 'REJECTED') => {
    const updated = orders.map(o => o.id === orderId ? { ...o, disputeStatus: status as DisputeStatus } : o);
    updateOrders(updated);
  };

  const treasuryStats: TreasuryStats = useMemo(() => {
    const totalInternalVolume = orders.reduce((s, o) => s + (o.subtotal ?? 0), 0);
    const totalDonations = orders.reduce((s, o) => s + (o.accounting?.donationAmount ?? 0), 0);
    const totalPlatformFees = orders.reduce((s, o) => s + (o.accounting?.platformFee ?? 0), 0);
    const totalFeesSaved = orders.reduce((s, o) => s + (o.accounting?.feesSaved ?? 0), 0);
    const totalOrders = orders.length;
    const uniqueNeighbors = new Set(orders.map(o => o.neighborId)).size;

    return {
      totalInternalVolume,
      totalDonations,
      totalPlatformFees,
      totalFeesSaved,
      totalOrders,
      uniqueNeighbors,
      // Macro-economic properties
      totalExternalInflow: totalInternalVolume * 1.25,
      totalExternalOutflow: totalInternalVolume * 0.35,
      moneyMultiplier: 2.8,
      retentionRate: 0.82,
      circularVelocity: 1.95
    };
  }, [orders]);

  return {
    orders,
    updateOrders,
    batches,
    selectedInvoiceOrder,
    setSelectedInvoiceOrder,
    treasuryStats,
    resolveDispute
  };
}
