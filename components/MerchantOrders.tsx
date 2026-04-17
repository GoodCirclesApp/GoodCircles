
import React, { useState, useMemo } from 'react';
import { Order } from '../types';
import { useGoodCirclesStore } from '../hooks/useGoodCirclesStore';
import { Package, Truck, CheckCircle, XCircle, Search, Filter, Clock, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export const MerchantOrders: React.FC = () => {
  const { orders, currentUser, updateOrders } = useGoodCirclesStore();
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [search, setSearch] = useState('');

  const merchantOrders = useMemo(() => {
    if (!currentUser?.merchantId) return [];
    return orders.filter(o => o.items.some(item => item.product.merchantId === currentUser.merchantId));
  }, [orders, currentUser]);

  const filteredOrders = merchantOrders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(search.toLowerCase()) || 
                         o.neighborName.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'ALL' || o.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    updateOrders(updated);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-3xl font-black italic uppercase tracking-tighter">Order Fulfillment</h3>
          <p className="text-slate-400 text-xs font-medium mt-1">Manage your {merchantOrders.length} customer orders and track delivery status.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" placeholder="Search orders..." 
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-[#7851A9]/10 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {['ALL', 'PENDING', 'SHIPPED', 'COMPLETED', 'CANCELLED'].map(f => (
          <button 
            key={f} onClick={() => setFilter(f as any)}
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === f ? 'bg-black text-white' : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-300'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {filteredOrders.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[4rem]">
            <p className="text-slate-400 font-bold italic">No orders found.</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="bg-white p-4 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all">
              <div className="flex flex-col lg:flex-row justify-between gap-4 sm:gap-8">
                <div className="flex-1 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-slate-50 rounded-2xl"><Package size={20} className="text-slate-400" /></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</p>
                        <p className="text-sm font-black uppercase tracking-tighter">#{order.id.slice(0, 8)}</p>
                      </div>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      order.status === 'PENDING' ? 'bg-amber-50 text-amber-600' :
                      order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-600' :
                      order.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' :
                      'bg-slate-50 text-slate-400'
                    }`}>
                      {order.status}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                        <img src={item.product.imageUrl} className="w-12 h-12 rounded-xl object-cover" />
                        <div className="flex-1">
                          <p className="text-xs font-black uppercase tracking-tight">{item.product.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold">Qty: {item.quantity} × ${item.product.price.toFixed(2)}</p>
                        </div>
                        <p className="text-sm font-black italic">${(item.quantity * item.product.price).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:w-80 space-y-6 lg:border-l lg:border-slate-50 lg:pl-8">
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</p>
                      <p className="text-sm font-black uppercase tracking-tight">{order.neighborName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                      <p className="text-sm font-black uppercase tracking-tight">{format(new Date(order.createdAt), 'MMM d, yyyy h:mm a')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Settlement</p>
                      <p className="text-sm font-black italic text-emerald-600">${order.accounting.merchantNet.toFixed(2)} Net</p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-50 space-y-3">
                    {order.status === 'PENDING' && (
                      <button 
                        onClick={() => handleStatusUpdate(order.id, 'SHIPPED')}
                        className="w-full py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] transition-all flex items-center justify-center gap-2"
                      >
                        <Truck size={14} /> Mark as Shipped
                      </button>
                    )}
                    {order.status === 'SHIPPED' && (
                      <button 
                        onClick={() => handleStatusUpdate(order.id, 'COMPLETED')}
                        className="w-full py-4 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={14} /> Mark as Completed
                      </button>
                    )}
                    {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                      <button 
                        onClick={() => handleStatusUpdate(order.id, 'CANCELLED')}
                        className="w-full py-4 border border-slate-100 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center gap-2"
                      >
                        <XCircle size={14} /> Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
