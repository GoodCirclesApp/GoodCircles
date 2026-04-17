import React, { useState, useEffect } from 'react';
import { useIdentityStore } from '../hooks/useIdentityStore';
import { Truck, Search, CheckCircle, Lock, TrendingUp, MapPin, Star, Activity } from 'lucide-react';

export const SupplyChainView: React.FC = () => {
  const { currentUser } = useIdentityStore();
  const [status, setStatus] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeclaration, setShowDeclaration] = useState(false);
  
  const [declaration, setDeclaration] = useState({
    externalSupplierName: '',
    productCategory: '',
    avgMonthlySpend: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!currentUser?.merchantId) {
      setLoading(false);
      return;
    }
    try {
      const [statusRes, matchesRes] = await Promise.all([
        fetch(`/api/supply-chain/status/${currentUser.merchantId}`),
        fetch(`/api/supply-chain/matches/${currentUser.merchantId}`)
      ]);
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setStatus(statusData);
      }
      if (matchesRes.ok) {
        const matchesData = await matchesRes.json();
        setMatches(matchesData);
      }
    } catch (err) {
      console.error('Failed to fetch supply chain data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeclare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.merchantId) return;
    try {
      const res = await fetch('/api/supply-chain/declare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId: currentUser.merchantId,
          ...declaration,
          avgMonthlySpend: parseFloat(declaration.avgMonthlySpend)
        })
      });
      if (res.ok) {
        setShowDeclaration(false);
        setDeclaration({ externalSupplierName: '', productCategory: '', avgMonthlySpend: '' });
        fetchData();
      }
    } catch (err) {
      console.error('Failed to declare relationship:', err);
    }
  };

  if (loading) return <div className="p-12 text-center font-black uppercase tracking-widest animate-pulse">Loading Supply Chain...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-12 font-sans overflow-x-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-6xl font-black tracking-tighter italic uppercase leading-none">Supply Chain Mapping</h1>
          <p className="text-slate-500 font-medium max-w-xl">Internalizing our community's supply chain to eliminate fees and leverage collective pricing.</p>
        </div>
        
        <button 
          onClick={() => setShowDeclaration(true)}
          className="bg-black text-white px-10 py-6 rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] shadow-2xl transition-all"
        >
          Declare Relationship
        </button>
      </div>

      {showDeclaration && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] p-12 max-w-xl w-full border-2 border-black shadow-2xl space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#7851A9]/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-black italic uppercase">Declare Supplier</h2>
              <p className="text-slate-500 font-medium">Help us map the community's external dependencies.</p>
            </div>

            <form onSubmit={handleDeclare} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Supplier Name</label>
                <input 
                  required
                  value={declaration.externalSupplierName}
                  onChange={e => setDeclaration({...declaration, externalSupplierName: e.target.value})}
                  className="w-full px-8 py-5 rounded-2xl border border-slate-100 bg-slate-50 outline-none font-bold"
                  placeholder="e.g. Sysco, Amazon Business"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Product Category</label>
                <select 
                  required
                  value={declaration.productCategory}
                  onChange={e => setDeclaration({...declaration, productCategory: e.target.value})}
                  className="w-full px-8 py-5 rounded-2xl border border-slate-100 bg-slate-50 outline-none font-bold appearance-none"
                >
                  <option value="">Select Category</option>
                  <option value="FOOD_BEVERAGE">Food & Beverage</option>
                  <option value="OFFICE_SUPPLIES">Office Supplies</option>
                  <option value="LOGISTICS">Logistics & Shipping</option>
                  <option value="IT_SERVICES">IT & Software</option>
                  <option value="MAINTENANCE">Maintenance & Repair</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Avg. Monthly Spend ($)</label>
                <input 
                  required
                  type="number"
                  value={declaration.avgMonthlySpend}
                  onChange={e => setDeclaration({...declaration, avgMonthlySpend: e.target.value})}
                  className="w-full px-8 py-5 rounded-2xl border border-slate-100 bg-slate-50 outline-none font-bold"
                  placeholder="e.g. 1200"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowDeclaration(false)}
                  className="flex-1 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 border-slate-100 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-5 rounded-2xl bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] transition-all"
                >
                  Save Declaration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 space-y-8">
          <h2 className="text-2xl font-black italic uppercase">Category Activation</h2>
          <div className="space-y-4">
            {status.map((s: any) => (
              <div key={s.category} className="bg-white border-2 border-black rounded-[2rem] p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#7851A9]">{s.category.replace('_', ' ')}</p>
                  {s.thresholdMet ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Lock className="w-5 h-5 text-slate-300" />
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Progress</p>
                    <p className="text-sm font-black italic">{s.merchantCount} / 75</p>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${s.thresholdMet ? 'bg-emerald-500' : 'bg-[#7851A9]'}`}
                      style={{ width: `${s.progressPct}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
            {status.length === 0 && (
              <div className="p-8 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No categories declared yet.</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <h2 className="text-2xl font-black italic uppercase">Internal Sourcing Matches</h2>
          <div className="space-y-6">
            {matches.map((match: any) => (
              <div key={match.id} className="bg-white border-2 border-black rounded-[2.5rem] p-8 flex flex-col md:flex-row gap-8 hover:shadow-2xl transition-all group">
                <div className="flex-1 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#7851A9]">{match.productCategory.replace('_', ' ')}</p>
                      <h3 className="text-3xl font-black italic uppercase leading-none group-hover:text-[#7851A9] transition-colors">{match.suggestedSupplier.businessName}</h3>
                    </div>
                    <div className="bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl flex items-center gap-3">
                      <TrendingUp className="w-5 h-5" />
                      <p className="text-lg font-black italic">${match.potentialSavings} / mo</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-2 text-slate-500">
                      <MapPin className="w-4 h-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Local Partner</p>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <Star className="w-4 h-4 text-amber-400" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Confidence: {Math.round(match.matchConfidence * 100)}%</p>
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col gap-4 justify-center">
                  <button className="flex-1 px-8 py-4 rounded-2xl bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] transition-all">
                    View Details
                  </button>
                  <button className="flex-1 px-8 py-4 rounded-2xl border-2 border-slate-100 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                    Ignore
                  </button>
                </div>
              </div>
            ))}
            {matches.length === 0 && (
              <div className="bg-slate-50 rounded-[3rem] p-16 text-center border-2 border-dashed border-slate-200 space-y-6">
                <Truck className="w-16 h-16 text-slate-200 mx-auto" />
                <div className="space-y-2">
                  <h3 className="text-xl font-black italic uppercase text-slate-400">No Matches Available</h3>
                  <p className="text-slate-400 font-medium max-w-sm mx-auto">Matches only surface once a category reaches the 75-merchant activation threshold in your region.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-black text-white rounded-[3rem] p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#7851A9]/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4">
            <Activity className="w-6 h-6 text-[#7851A9]" />
            <h2 className="text-xl font-black italic uppercase">Supply Chain Intelligence</h2>
          </div>
          <p className="text-slate-400 font-medium leading-relaxed max-w-3xl">
            By mapping our community's external spend, we identify opportunities to keep capital within the Good Circles network. Internal sourcing eliminates external processing fees and allows us to negotiate collective discounts that individual businesses cannot access alone. Your data is anonymized and used solely for community-wide matching and activation tracking.
          </p>
        </div>
      </div>
    </div>
  );
};
