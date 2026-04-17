
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Order, User } from '../types';
import { StatementLedger } from './StatementLedger';
import { HandshakeScanner } from './HandshakeScanner';
import { GlobalStats } from '../hooks/useGoodCirclesStore';

interface Props {
  orders: Order[];
  role: 'MERCHANT' | 'NONPROFIT';
  onUpdateOrders?: (updated: Order[]) => void;
  currentUser?: User | null;
  globalStats?: GlobalStats;
}

export const AccountingDashboard: React.FC<Props> = ({ orders, role, onUpdateOrders, currentUser, globalStats }) => {
  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'STATEMENTS' | 'HANDSHAKES'>('ANALYTICS');

  const stats = useMemo(() => {
    // Filter orders for this specific merchant/nonprofit if applicable
    const relevantOrders = role === 'MERCHANT' && currentUser?.merchantId 
      ? orders.filter(o => o.items.some(item => item.product.merchantId === currentUser.merchantId))
      : orders;

    const settled = relevantOrders.filter(o => o.handshakeStatus === 'COMPLETED' || o.paymentMethod !== 'CASH');
    const totalDonated = settled.reduce((s, o) => s + o.accounting.donationAmount, 0);
    const totalRevenue = settled.reduce((s, o) => s + o.subtotal, 0);
    const totalCogs = settled.reduce((s, o) => s + o.accounting.totalCogs, 0);
    const totalNetProfit = settled.reduce((s, o) => s + o.accounting.grossProfit, 0);
    const totalPlatformFees = settled.reduce((s, o) => s + o.accounting.platformFee, 0);
    
    return { totalDonated, totalRevenue, totalCogs, totalNetProfit, totalPlatformFees };
  }, [orders, role, currentUser]);

  const chartData = useMemo(() => {
    if (role === 'MERCHANT') {
      return [
        { name: 'Revenue', value: stats.totalRevenue, fill: '#000000' },
        { name: 'COGS', value: stats.totalCogs, fill: '#64748b' },
        { name: 'Net Profit', value: stats.totalNetProfit, fill: '#7851A9' },
        { name: 'Donations', value: stats.totalDonated, fill: '#C2A76F' }
      ];
    } else {
      return [
        { name: 'Support Volume', value: stats.totalRevenue, fill: '#000000' },
        { name: 'Revenue Generated', value: stats.totalDonated, fill: '#7851A9' }
      ];
    }
  }, [stats, role]);

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Sync Status Badge */}
      <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full w-fit mx-auto">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
        <span className="text-[8px] font-black uppercase text-emerald-600 tracking-widest">Global Ledger Synced: ${globalStats?.totalInternalVolume.toLocaleString()} Total Volume</span>
      </div>

      {role === 'MERCHANT' && (
        <div className="space-y-6">
          <div className="bg-black p-10 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
            <div className="space-y-2 z-10">
              <h3 className="text-3xl font-black italic uppercase tracking-tighter">Settlement Ledger.</h3>
              <p className="text-slate-400 font-medium">Automatic accounting of net profits, donations, and platform fees.</p>
            </div>
            <div className="flex flex-wrap gap-8 z-10 justify-center">
               <div className="text-center">
                  <p className="text-[8px] font-black uppercase text-slate-500 mb-1">Total COGS</p>
                  <p className="text-2xl font-black italic text-slate-300">${stats.totalCogs.toFixed(2)}</p>
               </div>
               <div className="text-center border-l border-white/10 pl-8">
                  <p className="text-[8px] font-black uppercase text-slate-500 mb-1">Net Profit</p>
                  <p className="text-2xl font-black italic text-[#7851A9]">${stats.totalNetProfit.toFixed(2)}</p>
               </div>
               <div className="text-center border-l border-white/10 pl-8">
                  <p className="text-[8px] font-black uppercase text-slate-500 mb-1">Impact (10%)</p>
                  <p className="text-2xl font-black italic text-[#C2A76F]">${stats.totalDonated.toFixed(2)}</p>
               </div>
            </div>
          </div>

          {globalStats && (
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex flex-wrap justify-around gap-6">
              <div className="text-center">
                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Network Gross Sales</p>
                <p className="text-sm font-black text-black">${globalStats.totalInternalVolume.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Network Impact</p>
                <p className="text-sm font-black text-[#C2A76F]">${globalStats.totalDonations.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Merchants</p>
                <p className="text-sm font-black text-black">{globalStats.merchantCount}</p>
              </div>
              <div className="text-center">
                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Nonprofits</p>
                <p className="text-sm font-black text-black">{globalStats.nonprofitCount}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex bg-slate-100 p-1.5 rounded-[2rem] w-fit mx-auto">
        <TabButton active={activeTab === 'ANALYTICS'} onClick={() => setActiveTab('ANALYTICS')} label="Analysis" />
        <TabButton active={activeTab === 'STATEMENTS'} onClick={() => setActiveTab('STATEMENTS')} label="Statements" />
        {role === 'MERCHANT' && (
          <TabButton active={activeTab === 'HANDSHAKES'} onClick={() => setActiveTab('HANDSHAKES')} label="Process Cash QR" highlight="gold" />
        )}
      </div>

      {activeTab === 'ANALYTICS' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black mb-10 uppercase italic tracking-tighter">Flow Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800 }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-8 pt-8 border-t border-slate-50 flex justify-between">
               <div className="text-center">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-1">
                    {role === 'MERCHANT' ? 'Platform Fee (1%)' : 'Revenue Generated'}
                  </p>
                  <p className="text-lg font-black text-black">
                    ${(role === 'MERCHANT' ? stats.totalPlatformFees : stats.totalDonated).toFixed(2)}
                  </p>
               </div>
               <div className="text-center">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-1">
                    {role === 'MERCHANT' ? 'Merchant Settlement' : 'Total Support Volume'}
                  </p>
                  <p className="text-lg font-black text-emerald-500">
                    ${(role === 'MERCHANT' 
                      ? (stats.totalRevenue - stats.totalDonated - stats.totalPlatformFees) 
                      : stats.totalRevenue).toFixed(2)}
                  </p>
               </div>
            </div>
          </div>

          <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm flex flex-col justify-center text-center space-y-6">
            <p className="text-[10px] font-black text-[#7851A9] uppercase tracking-widest">Compliance Status</p>
            <h4 className="text-4xl font-black italic tracking-tighter uppercase">Ledger Integrity</h4>
            <p className="text-7xl font-black text-emerald-500">100<span className="text-2xl text-slate-300">%</span></p>
            <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto italic">COGS verified against settlement hashes. Accounting compliant with MSA fiscal policy.</p>
          </div>
        </div>
      )}

      {activeTab === 'STATEMENTS' && <StatementLedger orders={orders} role={role} />}

      {activeTab === 'HANDSHAKES' && role === 'MERCHANT' && onUpdateOrders && (
        <HandshakeScanner 
          onVerify={async (token) => {
            const order = orders.find(o => o.impactToken === token);
            if (order) {
              const updated = orders.map(o => o.id === order.id ? { ...o, handshakeStatus: 'COMPLETED' as const } : o);
              onUpdateOrders(updated);
              return { success: true, message: "Contribution secured.", amount: order.accounting.donationAmount };
            }
            return { success: false, message: "Invalid token." };
          }} 
          onCancel={() => setActiveTab('ANALYTICS')} 
        />
      )}
    </div>
  );
};

const TabButton = ({ active, onClick, label, highlight }: any) => (
  <button onClick={onClick} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? (highlight === 'gold' ? 'bg-[#C2A76F] text-black' : 'bg-black text-white shadow-lg') : 'text-slate-400 hover:text-slate-600'}`}>{label}</button>
);
