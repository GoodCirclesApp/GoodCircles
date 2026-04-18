
import React, { useState, useEffect } from 'react';
import { merchantService } from '../services/merchantService';
import { Download, Filter, Calendar, Search, FileText, TrendingUp, Heart, Shield, Percent, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

export const MerchantFinancials: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchReport();
  }, [dateRange]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await merchantService.getFinancialReport(dateRange);
      setTransactions(data);
    } catch (err) {
      console.error('Failed to fetch financial report', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const headers = ['Date', 'Product', 'Gross (MSRP)', 'Member Discount', 'Nonprofit Donation', 'Platform Fee', 'Merchant Net', 'Nonprofit'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(t => [
        format(new Date(t.createdAt), 'yyyy-MM-dd HH:mm'),
        t.productService?.name || 'Platform',
        t.grossAmount,
        t.discountWaived ? 0 : t.discountAmount,
        t.nonprofitShare,
        t.platformFee,
        t.merchantNet,
        t.nonprofit?.orgName || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `financial_report_${dateRange.startDate}_${dateRange.endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totals = transactions.reduce((acc, t) => ({
    gross: acc.gross + t.grossAmount,
    discount: acc.discount + (t.discountWaived ? 0 : t.discountAmount),
    nonprofit: acc.nonprofit + t.nonprofitShare,
    platform: acc.platform + t.platformFee,
    net: acc.net + t.merchantNet
  }), { gross: 0, discount: 0, nonprofit: 0, platform: 0, net: 0 });

  const filteredTransactions = transactions.filter(t => 
    t.productService?.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.nonprofit?.orgName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-3xl font-black italic uppercase tracking-tighter">Financial Settlement Hub.</h3>
          <p className="text-slate-400 text-xs font-medium mt-1">Audit your transactions, export reports, and track tax credits.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
            <input 
              type="date" value={dateRange.startDate} onChange={e => setDateRange({...dateRange, startDate: e.target.value})}
              className="px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none border-r border-slate-50"
            />
            <input 
              type="date" value={dateRange.endDate} onChange={e => setDateRange({...dateRange, endDate: e.target.value})}
              className="px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none"
            />
          </div>
          <button 
            onClick={handleExport}
            className="bg-black text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] shadow-xl transition-all flex items-center gap-2"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard label="Gross Volume" value={totals.gross} icon={DollarSign} color="text-blue-600" bg="bg-blue-50" />
        <MetricCard label="Member Discounts Given" value={totals.discount} icon={Percent} color="text-amber-600" bg="bg-amber-50" note="Tax deductible" />
        <MetricCard label="Nonprofit Donations" value={totals.nonprofit} icon={Heart} color="text-rose-600" bg="bg-rose-50" note="Tax deductible" />
        <MetricCard label="Platform Fees" value={totals.platform} icon={Shield} color="text-indigo-600" bg="bg-indigo-50" />
        <MetricCard label="Merchant Net" value={totals.net} icon={TrendingUp} color="text-emerald-600" bg="bg-emerald-50" />
      </div>

      <div className="bg-white rounded-[2rem] sm:rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <h4 className="text-xl font-black italic uppercase tracking-tighter">Transaction Ledger</h4>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" placeholder="Filter by product or nonprofit..." 
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none"
            />
          </div>
        </div>
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full min-w-[600px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Asset Node</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Gross (MSRP)</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-amber-400">Member Discount</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-rose-400">Donation (10%)</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Platform (1%)</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Net Settlement</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Nonprofit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={8} className="p-12 text-center animate-pulse text-slate-400 font-bold italic">Auditing Global Ledger...</td></tr>
              ) : filteredTransactions.length === 0 ? (
                <tr><td colSpan={8} className="p-12 text-center text-slate-400 font-bold italic">No transactions found for this period.</td></tr>
              ) : (
                filteredTransactions.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-6 text-[10px] font-bold text-slate-500">{format(new Date(t.createdAt), 'MMM d, yyyy HH:mm')}</td>
                    <td className="p-6 text-[10px] font-black uppercase tracking-tight">{t.productService?.name || 'Platform'}</td>
                    <td className="p-6 text-[10px] font-black italic">${t.grossAmount.toFixed(2)}</td>
                    <td className="p-6 text-[10px] font-black italic text-amber-500">{t.discountWaived ? <span className="text-slate-300">—</span> : `$${t.discountAmount.toFixed(2)}`}</td>
                    <td className="p-6 text-[10px] font-black italic text-rose-500">${t.nonprofitShare.toFixed(2)}</td>
                    <td className="p-6 text-[10px] font-black italic text-indigo-500">${t.platformFee.toFixed(2)}</td>
                    <td className="p-6 text-[10px] font-black italic text-emerald-500">${t.merchantNet.toFixed(2)}</td>
                    <td className="p-6 text-[10px] font-black uppercase tracking-tight text-slate-400">{t.nonprofit?.orgName || 'N/A'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-slate-900 p-5 sm:p-10 rounded-[2rem] sm:rounded-[4rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 shadow-2xl relative overflow-hidden">
        <div className="space-y-4 z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl"><FileText size={24} /></div>
            <h3 className="text-3xl font-black italic uppercase tracking-tighter">Tax Deduction Summary.</h3>
          </div>
          <p className="text-slate-400 font-medium max-w-md">Two separate deductions apply to every Good Circles sale: your nonprofit donation (charitable contribution) and the member discount you gave customers (business expense). Both reduce your taxable income. Download your annual certificate for your tax advisor.</p>
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <div className="bg-white/5 px-6 py-4 rounded-2xl border border-white/10">
              <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Discounts Given</p>
              <p className="text-2xl font-black italic text-white">${totals.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              <p className="text-[10px] text-slate-500 mt-1">Business expense deduction</p>
            </div>
            <div className="bg-white/5 px-6 py-4 rounded-2xl border border-white/10">
              <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Donations Made</p>
              <p className="text-2xl font-black italic text-white">${totals.nonprofit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              <p className="text-[10px] text-slate-500 mt-1">Charitable contribution deduction</p>
            </div>
          </div>
        </div>
        <div className="bg-white/5 p-5 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border border-white/10 text-center w-full sm:min-w-[260px] z-10 shrink-0">
          <p className="text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">Total Deductible</p>
          <p className="text-5xl font-black italic text-emerald-400">${(totals.nonprofit + totals.discount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <p className="text-[10px] text-slate-500 mt-2">Donations + Discounts</p>
          <button className="mt-6 w-full py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all">Download Certificate</button>
        </div>
        <div className="absolute -left-20 -bottom-20 opacity-5">
          <TrendingUp size={400} />
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, icon: Icon, color, bg, note }: any) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
    <div className={`w-10 h-10 ${bg} ${color} rounded-xl flex items-center justify-center mb-4`}>
      <Icon size={20} />
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    <p className="text-2xl font-black italic mt-1">${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
    {note && <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">{note}</p>}
  </div>
);

const DollarSign = (props: any) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
