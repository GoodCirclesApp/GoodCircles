
import React, { useState } from 'react';
import { Wallet, WalletTransaction } from '../types';
import { format } from 'date-fns';
import { BrandSubmark } from '../components/BrandAssets';
import { ConsumerQRDisplay } from '../components/QRPaymentSystem';

interface Props {
  balance: number;
  creditBalance: number;
  transactions: WalletTransaction[];
  onTopUp: (amount: number) => Promise<void>;
  onWithdraw: (amount: number) => Promise<void>;
  isLoading: boolean;
  onToast?: (message: string, type?: 'success' | 'error') => void;
}

export const WalletView: React.FC<Props> = ({
  balance,
  creditBalance,
  transactions,
  onTopUp,
  onWithdraw,
  isLoading,
  onToast,
}) => {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'WALLET' | 'PAY_IN_PERSON'>('WALLET');

  const handleAction = async (action: 'topup' | 'withdraw') => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;

    setIsProcessing(true);
    try {
      if (action === 'topup') {
        await onTopUp(val);
        onToast?.(`$${val.toFixed(2)} added to your Circle Account`, 'success');
      } else {
        await onWithdraw(val);
        onToast?.(`$${val.toFixed(2)} withdrawal initiated`, 'success');
      }
      setAmount('');
    } catch (err) {
      onToast?.('Transaction failed. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
      <header>
        <h2 className="text-4xl sm:text-7xl font-black text-black tracking-tighter italic uppercase leading-[0.9]">My Wallet.</h2>
        <p className="text-slate-500 text-2xl font-medium mt-6">Manage your capital and track your platform rewards.</p>
      </header>

      {/* Tab switcher */}
      <div className="flex gap-3">
        {[
          { id: 'WALLET', label: 'Circle Account' },
          { id: 'PAY_IN_PERSON', label: 'Pay in Person' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-[#7851A9] text-white shadow-md' : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'PAY_IN_PERSON' && (
        <div className="bg-white border border-[#CA9CE1]/20 rounded-[3rem] p-8 shadow-xl">
          <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-8">In-Person Payment QR</h3>
          <ConsumerQRDisplay />
        </div>
      )}

      {activeTab === 'WALLET' && <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Balance Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-black text-white p-6 sm:p-12 rounded-[4rem] shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-[#C2A76F]">Available Balance</p>
              <h3 className="text-4xl sm:text-7xl font-black italic tracking-tighter">${balance.toLocaleString()}</h3>
              <p className="text-xs mt-6 opacity-40 font-medium">Liquid capital for marketplace transactions.</p>
            </div>
            <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-1000">
              <BrandSubmark size={240} variant="WHITE" showCrown={true} />
            </div>
          </div>

          <div className="bg-[#7851A9] text-white p-6 sm:p-12 rounded-[4rem] shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-white/60">Platform Credits</p>
              <h3 className="text-4xl sm:text-7xl font-black italic tracking-tighter">${creditBalance.toLocaleString()}</h3>
              <p className="text-xs mt-6 opacity-40 font-medium">Earned rewards from your community impact.</p>
            </div>
            <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-1000">
              <BrandSubmark size={240} variant="WHITE" showCrown={true} />
            </div>
          </div>
        </div>

        {/* Action Form */}
        <div className="bg-white border border-[#CA9CE1]/20 p-5 sm:p-12 rounded-[2rem] sm:rounded-[4rem] shadow-xl space-y-6 sm:space-y-8">
          <h4 className="text-xl font-black italic uppercase tracking-tighter">Quick Actions</h4>
          <div className="space-y-4">
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">$</span>
              <input 
                type="number" 
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full p-6 pl-12 bg-slate-50 border border-slate-100 rounded-3xl text-2xl font-black outline-none focus:ring-4 focus:ring-[#7851A9]/10"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleAction('topup')}
                disabled={isProcessing || !amount}
                className="bg-black text-white py-6 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] transition-all disabled:opacity-50"
              >
                {isProcessing ? '...' : 'Fund Wallet'}
              </button>
              <button 
                onClick={() => handleAction('withdraw')}
                disabled={isProcessing || !amount || parseFloat(amount) > balance}
                className="border-2 border-black text-black py-6 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all disabled:opacity-50"
              >
                {isProcessing ? '...' : 'Withdraw'}
              </button>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-medium text-center italic">Withdrawals are processed within 24-48 hours to your linked account.</p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white border border-[#CA9CE1]/20 rounded-[4rem] shadow-xl overflow-hidden">
        <div className="p-5 sm:p-10 border-b border-slate-50 flex justify-between items-center">
          <h4 className="text-2xl font-black italic uppercase tracking-tighter">Transaction History</h4>
          <button className="text-[10px] font-black uppercase tracking-widest text-[#7851A9] hover:underline">Download CSV</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Description</th>
                <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Type</th>
                <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-10 py-24 text-center text-slate-400 italic font-medium">No transactions found in your history.</td>
                </tr>
              ) : (
                transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-10 py-8 text-sm font-bold text-slate-500">{format(new Date(tx.date), 'MMM dd, yyyy')}</td>
                    <td className="px-10 py-8 text-sm font-black italic uppercase tracking-tight">{tx.description}</td>
                    <td className="px-10 py-8">
                      <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${tx.type === 'CREDIT' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className={`px-10 py-8 text-right text-lg font-black tracking-tighter ${tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {tx.type === 'CREDIT' ? '+' : '-'}${tx.amount.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>}
    </div>
  );
};
