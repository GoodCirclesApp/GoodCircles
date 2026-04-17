
import React, { useState, useEffect } from 'react';
import { Order, User, ComplianceData } from '../types';
import { generateTaxStatement } from '../services/aiReportingService';
import { BrandLogo, BrandSubmark } from './BrandAssets';
import { Download, FileText, ShieldCheck } from 'lucide-react';

interface Props {
  orders: Order[];
  user: User;
}

export const TaxCenter: React.FC<Props> = ({ orders, user }) => {
  const [statement, setStatement] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState('2024');

  const filteredOrders = orders.filter(o => 
    new Date(o.date).getFullYear().toString() === selectedYear &&
    (user.role === 'MERCHANT' ? true : o.neighborId === user.id)
  );

  const totalDonated = filteredOrders.reduce((sum, o) => sum + o.accounting.donationAmount, 0);

  const handleGenerate = async () => {
    setLoading(true);
    const text = await generateTaxStatement(filteredOrders, user.name, selectedYear);
    setStatement(text);
    setLoading(false);
  };

  const handleDownload1099B = async () => {
    if (!user.merchantId) return;
    try {
      const res = await fetch(`/api/netting/compliance/${user.merchantId}?year=${selectedYear}`);
      if (!res.ok) throw new Error('Failed to fetch 1099-B data');
      const data: ComplianceData = await res.json();
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `1099B_Compliance_${user.merchantId}_${selectedYear}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <header className="max-w-3xl">
        <h2 className="text-7xl font-black text-black tracking-tighter italic uppercase leading-[0.9]">Tax Center.</h2>
        <p className="text-slate-500 text-2xl font-medium mt-8">Automated IRS-compliant 501(c)(3) receipting for your community impact.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-10 rounded-[3rem] border border-[#CA9CE1]/20 shadow-sm">
            <h3 className="text-xl font-black uppercase italic tracking-tighter mb-6">Statement Settings</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Fiscal Year</label>
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold outline-none"
                >
                  <option value="2024">2024 Fiscal Year</option>
                  <option value="2023">2023 Fiscal Year</option>
                </select>
              </div>
              <div className="p-6 bg-[#7851A9]/5 rounded-2xl border border-[#7851A9]/10">
                <p className="text-[10px] font-black text-[#7851A9] uppercase mb-1">Total Deductible Value</p>
                <p className="text-3xl font-black italic tracking-tighter">${totalDonated.toFixed(2)}</p>
              </div>
              <button 
                onClick={handleGenerate}
                disabled={loading || filteredOrders.length === 0}
                className="w-full bg-black text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] transition-all shadow-xl disabled:opacity-30"
              >
                {loading ? 'Generating Receipt...' : 'Generate Official Statement'}
              </button>
            </div>
          </div>

          {user.role === 'MERCHANT' && (
            <div className="bg-[#141414] text-white p-10 rounded-[3rem] shadow-2xl space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl">
                  <ShieldCheck size={24} className="text-[#CA9CE1]" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase italic tracking-tighter">1099-B Compliance</h3>
                  <p className="text-[8px] font-bold text-white/50 uppercase tracking-widest">Inter-Merchant Settlement</p>
                </div>
              </div>
              <p className="text-xs text-white/70 leading-relaxed font-medium">
                Download your consolidated inter-merchant settlement data for IRS 1099-B reporting. This includes all gross and net settlement amounts from mutual credit cycles.
              </p>
              <button 
                onClick={handleDownload1099B}
                className="w-full bg-white text-black py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#CA9CE1] transition-all flex items-center justify-center gap-2"
              >
                <Download size={14} />
                Download 1099-B Data
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {statement ? (
            <div className="bg-white p-16 rounded-[4rem] border-2 border-slate-100 shadow-2xl relative overflow-hidden animate-in zoom-in duration-500">
              <div className="absolute top-0 right-0 p-12 opacity-5">
                <BrandSubmark size={120} color="#000" />
              </div>
              <div className="relative z-10 space-y-10">
                <div className="flex justify-between items-start border-b border-slate-100 pb-10">
                  <BrandLogo variant="BLACK" size="200px" />
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-slate-400">Official Document</p>
                    <p className="text-sm font-bold">Ref: TAX-CERT-{Date.now().toString().slice(-6)}</p>
                  </div>
                </div>
                <div className="prose prose-slate max-w-none">
                  <div className="text-slate-700 font-medium leading-relaxed whitespace-pre-wrap italic">
                    {statement}
                  </div>
                </div>
                <div className="pt-10 border-t border-slate-100 flex justify-between items-center">
                  <button onClick={() => window.print()} className="bg-slate-100 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">Print PDF</button>
                  <p className="text-[8px] font-bold text-slate-300 uppercase">Certified by Good Circles Compliance Hub</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-20 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[4rem] opacity-40">
              <BrandSubmark size={80} color="#CA9CE1" className="mb-6" showCrown={false} />
              <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Select a fiscal year and generate your summary.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SummaryItem = ({ label, value, color = "text-slate-500", isBold = false }: { label: string, value: string, color?: string, isBold?: boolean }) => (
  <div className="space-y-1">
    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest font-accent">{label}</p>
    <p className={`${isBold ? 'text-4xl' : 'text-2xl'} font-black italic tracking-tighter ${color}`}>{value}</p>
  </div>
);
