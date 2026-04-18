
import React, { useState, useEffect } from 'react';
import { useGoodCirclesStore } from '../hooks/useGoodCirclesStore';
import { BrandSubmark } from './BrandAssets';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, History, Clock, CheckCircle2 } from 'lucide-react';

export const CreditDashboard: React.FC = () => {
  const { currentUser } = useGoodCirclesStore();
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [expiringSoon, setExpiringSoon] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCreditData();
  }, []);

  const fetchCreditData = async () => {
    setLoading(true);
    try {
      // In a real app, these would be API calls
      // For this demo, we'll simulate with mock data or use the store if available
      // Since we don't have a real backend in this environment, we'll use local state/mock
      
      // Mock balance and history
      setBalance(currentUser?.platformCredits || 0);
      
      // Mock history from a hypothetical ledger
      const mockHistory = [
        { id: '1', amount: 12.50, source: 'DISCOUNT', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), type: 'EARNED' },
        { id: '2', amount: 5.00, source: 'REFERRAL', createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), type: 'EARNED' },
        { id: '3', amount: 10.00, source: 'PURCHASE', createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), type: 'REDEEMED' },
      ];
      setHistory(mockHistory);

      const mockExpiring = [
        { id: '1', amount: 12.50, expiresAt: new Date(Date.now() + 86400000 * 15).toISOString() }
      ];
      setExpiringSoon(mockExpiring);

    } catch (err) {
      console.error('Failed to fetch credit data', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#7851A9] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <header className="max-w-3xl">
        <div className="flex items-center gap-3 mb-4">
           <div className="w-2 h-2 rounded-full bg-[#7851A9] animate-pulse"></div>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#7851A9] font-accent">Platform Credit System</p>
        </div>
        <h2 className="text-7xl font-black text-black tracking-tighter italic uppercase leading-[0.9]">Credit Ledger.</h2>
        <p className="text-slate-500 text-2xl font-medium mt-8">Earn and redeem platform credits to maximize your community purchasing power.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Balance Card */}
        <div className="bg-black text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden group">
          <div className="relative z-10 space-y-10">
            <div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-2">Available Credits</p>
              <div className="flex items-baseline gap-2">
                <p className="text-6xl font-black italic tracking-tighter text-[#CA9CE1]">${balance.toFixed(2)}</p>
                <Coins className="text-[#CA9CE1] w-8 h-8" />
              </div>
            </div>
            
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-4 h-4 text-[#CA9CE1]" />
                <p className="text-[10px] font-black uppercase tracking-widest">Expiring Soon</p>
              </div>
              {expiringSoon.length > 0 ? (
                expiringSoon.map(item => (
                  <p key={item.id} className="text-sm font-medium text-white/80">
                    ${item.amount.toFixed(2)} expires on {new Date(item.expiresAt).toLocaleDateString()}
                  </p>
                ))
              ) : (
                <p className="text-sm font-medium text-white/40">No credits expiring in the next 30 days.</p>
              )}
            </div>
          </div>
          <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-1000">
            <BrandSubmark size={140} variant="WHITE" showCrown={true} />
          </div>
        </div>

        {/* How Credits Work Card */}
        <div className="bg-white rounded-[4rem] border border-[#CA9CE1]/20 p-12 shadow-sm flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-[#7851A9]" />
              <h3 className="text-2xl font-black italic uppercase tracking-tighter">How Credits Work</h3>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                Your <span className="font-black text-black">10% member discount</span> applies automatically at every checkout — it is a fixed benefit, not a choice.
              </p>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                Platform credits are separate rewards earned through referrals and community programs. They can be applied to reduce the cost of any future purchase.
              </p>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Credit Expiry Policy</p>
                <p className="text-sm font-bold text-black mt-1">Credits are valid for 12 months from the date issued.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-[#7851A9] text-white p-12 rounded-[4rem] shadow-xl flex flex-col justify-center space-y-6">
          <h3 className="text-3xl font-black italic uppercase tracking-tighter">Earn Credits.</h3>
          <p className="text-white/80 text-sm font-medium leading-relaxed">
            Credits are community rewards — earned by growing the network and participating in programs. They supplement your automatic 10% discount and keep value circulating locally.
          </p>
          <div className="pt-4">
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">1</div>
              <span>Refer a Merchant</span>
            </div>
            <div className="w-px h-4 bg-white/20 ml-4 my-1"></div>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">2</div>
              <span>Earn Reward Credits</span>
            </div>
            <div className="w-px h-4 bg-white/20 ml-4 my-1"></div>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">3</div>
              <span>Redeem Within 12 Months</span>
            </div>
          </div>
        </div>
      </div>

      {/* History Section */}
      <div className="bg-white rounded-[4rem] border border-[#CA9CE1]/20 p-12 md:p-16 shadow-sm">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3">
            <History className="w-6 h-6 text-[#7851A9]" />
            <h3 className="text-2xl font-black italic uppercase tracking-tighter">Transaction History</h3>
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-accent">Audit-Safe Ledger</span>
        </div>

        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="py-20 text-center opacity-20">
              <BrandSubmark size={60} color="#000" showCrown={false} className="mx-auto mb-4" />
              <p className="font-black text-[10px] uppercase">No credit activity yet</p>
            </div>
          ) : (
            history.map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:border-[#7851A9]/20 transition-all hover:bg-white hover:shadow-lg group">
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center shadow-inner ${
                    tx.type === 'EARNED' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {tx.type === 'EARNED' ? <Coins className="w-6 h-6" /> : <History className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase text-slate-900 tracking-tight">
                      {tx.source} {tx.type === 'EARNED' ? 'EARNED' : 'REDEEMED'}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 font-accent">
                      {new Date(tx.createdAt).toLocaleString()} | TXN-{tx.id}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-black italic tracking-tighter ${
                    tx.type === 'EARNED' ? 'text-emerald-500' : 'text-amber-500'
                  }`}>
                    {tx.type === 'EARNED' ? '+' : '-'}${tx.amount.toFixed(2)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
