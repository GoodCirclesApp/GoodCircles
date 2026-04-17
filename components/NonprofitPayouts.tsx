
import React from 'react';
import { CreditCard, CheckCircle2, Clock, ArrowRight, ExternalLink, ShieldCheck } from 'lucide-react';

const MOCK_PAYOUTS = [
  { id: 'p1', amount: 4500, date: '2026-03-15', status: 'PAID', method: 'Stripe •••• 4242' },
  { id: 'p2', amount: 3200, date: '2026-02-15', status: 'PAID', method: 'Stripe •••• 4242' },
  { id: 'p3', amount: 2800, date: '2026-01-15', status: 'PAID', method: 'Stripe •••• 4242' },
  { id: 'p4', amount: 1500, date: '2026-04-15', status: 'PENDING', method: 'Stripe •••• 4242' },
];

export const NonprofitPayouts: React.FC = () => {
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-16 opacity-5">
            <CreditCard size={200} />
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2">Payout Hub</h3>
                <p className="text-slate-400 text-xs font-medium">Automated fund distribution via Stripe Connect</p>
              </div>
              <div className="px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 flex items-center gap-3">
                <ShieldCheck size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Stripe Connected</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pending Payout</p>
                <p className="text-4xl font-black tracking-tighter text-[#7851A9]">$1,500.00</p>
                <p className="text-[10px] font-medium text-slate-400 mt-4 italic">Estimated arrival: April 15, 2026</p>
              </div>
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Paid Out</p>
                <p className="text-4xl font-black tracking-tighter">$38,450.00</p>
                <p className="text-[10px] font-medium text-slate-400 mt-4 italic">Since joining GoodCircles</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-black text-white p-12 rounded-[4rem] shadow-2xl space-y-8">
          <h4 className="text-xl font-black italic uppercase tracking-tighter">Stripe Settings</h4>
          <p className="text-slate-400 text-xs font-medium leading-relaxed italic">
            Manage your bank account, tax information, and payout schedule directly on your Stripe dashboard.
          </p>
          <div className="space-y-4 pt-4">
            <button className="w-full bg-white text-black py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] hover:text-white transition-all flex items-center justify-center gap-3">
              Go to Stripe Dashboard
              <ExternalLink size={14} />
            </button>
            <button className="w-full bg-white/10 text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">
              View Tax Documents
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-slate-50">
          <h3 className="text-xl font-black uppercase tracking-tight">Payout History</h3>
          <p className="text-slate-400 text-xs font-medium">Detailed log of all funds received</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {MOCK_PAYOUTS.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-10 py-8 font-black text-lg">${p.amount.toLocaleString()}</td>
                  <td className="px-10 py-8 text-sm font-bold text-slate-500">{new Date(p.date).toLocaleDateString()}</td>
                  <td className="px-10 py-8 text-xs font-medium text-slate-400 italic">{p.method}</td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3">
                      {p.status === 'PAID' ? (
                        <CheckCircle2 className="text-emerald-500" size={16} />
                      ) : (
                        <Clock className="text-amber-500" size={16} />
                      )}
                      <span className={`text-[10px] font-black uppercase tracking-widest ${
                        p.status === 'PAID' ? 'text-emerald-500' : 'text-amber-500'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <button className="text-[10px] font-black uppercase tracking-widest text-[#7851A9] hover:text-black transition-colors flex items-center gap-2">
                      View Receipt
                      <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
