
import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { marketplaceService } from '../services/marketplaceService';
import { format } from 'date-fns';
import { BrandSubmark } from '../components/BrandAssets';

export const OrderHistoryView: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await marketplaceService.listOrders();
        setOrders(data.orders);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
      <header>
        <h2 className="text-7xl font-black text-black tracking-tighter italic uppercase leading-[0.9]">Order History.</h2>
        <p className="text-slate-500 text-2xl font-medium mt-6">Review your past transactions and their community impact.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Order List */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-[2.5rem]"></div>
            ))
          ) : orders.length === 0 ? (
            <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[4rem]">
              <p className="text-slate-400 font-bold italic">You haven't placed any orders yet.</p>
            </div>
          ) : (
            orders.map(order => (
              <button 
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`w-full p-8 rounded-[3rem] border text-left transition-all flex items-center justify-between group ${selectedOrder?.id === order.id ? 'bg-black text-white border-black shadow-2xl' : 'bg-white text-black border-[#CA9CE1]/20 hover:shadow-xl'}`}
              >
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${selectedOrder?.id === order.id ? 'bg-white/10' : 'bg-slate-50'}`}>
                    <BrandSubmark size={32} variant={selectedOrder?.id === order.id ? 'WHITE' : 'BLACK'} />
                  </div>
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${selectedOrder?.id === order.id ? 'text-[#C2A76F]' : 'text-[#7851A9]'}`}>GC-{order.id.slice(-6).toUpperCase()}</p>
                    <h3 className="text-xl font-black italic uppercase tracking-tighter">{format(new Date(order.createdAt), 'MMMM dd, yyyy')}</h3>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black italic tracking-tighter">${order.grossAmount.toLocaleString()}</p>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${selectedOrder?.id === order.id ? 'text-white/40' : 'text-slate-400'}`}>{order.status}</p>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Order Details Panel */}
        <div className="lg:sticky lg:top-24 h-fit">
          {selectedOrder ? (
            <div className="bg-white border border-[#CA9CE1]/20 p-10 rounded-[4rem] shadow-2xl space-y-8 animate-in slide-in-from-right-8 duration-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#7851A9] mb-1">Financial Breakdown</p>
                  <h4 className="text-3xl font-black italic uppercase tracking-tighter">Receipt.</h4>
                </div>
                <div className="px-4 py-2 bg-slate-100 rounded-full text-[8px] font-black uppercase tracking-widest">Paid via {selectedOrder.paymentMethod}</div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-slate-400">Subtotal</span>
                  <span className="font-black">${selectedOrder.grossAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-emerald-600">
                  <span>Neighbor Discount</span>
                  <span className="font-black">-${(selectedOrder.grossAmount * 0.1).toFixed(2)}</span>
                </div>
                <div className="pt-4 border-t border-slate-50 flex justify-between">
                  <span className="text-lg font-black italic uppercase tracking-tighter">Total Paid</span>
                  <span className="text-lg font-black italic tracking-tighter">${(selectedOrder.grossAmount * 0.9).toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-50 space-y-6">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Impact Generated</h5>
                
                <div className="p-6 bg-slate-50 rounded-3xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#7851A9] uppercase tracking-wider">Nonprofit Share</span>
                    <span className="text-xl font-black italic tracking-tighter text-black">${selectedOrder.nonprofitShare.toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium italic">Sent to: {selectedOrder.nonprofit?.orgName || 'Elected Nonprofit'}</p>
                </div>

                <div className="p-6 bg-[#7851A9]/5 rounded-3xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#7851A9] uppercase tracking-wider">Platform Fee</span>
                    <span className="text-xl font-black italic tracking-tighter text-black">${selectedOrder.platformFee.toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium italic">Invested in Good Circles infrastructure.</p>
                </div>
              </div>

              <button className="w-full bg-black text-white py-6 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] transition-all">Download Receipt</button>
            </div>
          ) : (
            <div className="bg-slate-50 p-12 rounded-[4rem] text-center space-y-4">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                <BrandSubmark size={40} variant="BLACK" />
              </div>
              <p className="text-slate-400 font-bold italic">Select an order to view the full financial breakdown.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
