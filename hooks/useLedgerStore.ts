
import { useState, useEffect, useMemo } from 'react';
import { Order, PayoutBatch, TreasuryStats, DisputeStatus } from '../types';
import { AccountingService } from '../services/accountingService';
import { MOCK_ORDERS } from '../constants';

export function useLedgerStore() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [batches, setBatches] = useState<PayoutBatch[]>([]);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  useEffect(() => {
    const savedOrders = localStorage.getItem('gc_orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    } else {
      setOrders(MOCK_ORDERS);
      localStorage.setItem('gc_orders', JSON.stringify(MOCK_ORDERS));
    }

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
    const totalInternalVolume = orders.reduce((s, o) => s + o.subtotal, 0);
    const totalDonations = orders.reduce((s, o) => s + o.accounting.donationAmount, 0);
    const totalPlatformFees = orders.reduce((s, o) => s + o.accounting.platformFee, 0);
    const totalFeesSaved = orders.reduce((s, o) => s + o.accounting.feesSaved, 0);
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
