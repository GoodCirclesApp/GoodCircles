
import React, { useState, useEffect } from 'react';
import { Initiative, neighborService } from '../services/neighborService';
import { BrandSubmark } from '../components/BrandAssets';

export const CommunityInitiativesView: React.FC = () => {
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [waiveAmount, setWaiveAmount] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitiatives = async () => {
      try {
        const data = await neighborService.listInitiatives();
        setInitiatives(data);
      } catch (err) {
        console.error('Failed to fetch initiatives:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitiatives();
  }, []);

  const handleWaive = async (id: string) => {
    const amount = parseFloat(waiveAmount[id]);
    if (isNaN(amount) || amount <= 0) return;

    setIsProcessing(id);
    try {
      await neighborService.waiveDiscountToInitiative(id, amount);
      // Refresh initiatives
      const data = await neighborService.listInitiatives();
      setInitiatives(data);
      setWaiveAmount({ ...waiveAmount, [id]: '' });
      alert('Thank you for your contribution!');
    } catch (err) {
      alert('Failed to process contribution.');
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
      <header className="max-w-3xl">
        <h2 className="text-3xl sm:text-7xl font-black text-black tracking-tighter italic uppercase leading-[0.9]">Community Initiatives.</h2>
        <p className="text-slate-500 text-base sm:text-2xl font-medium mt-4 sm:mt-8">Direct your savings toward collective projects that build a better future for everyone.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-96 bg-slate-100 animate-pulse rounded-[4rem]"></div>
          ))
        ) : initiatives.length === 0 ? (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-100 rounded-[4rem]">
            <p className="text-slate-400 font-bold italic">No active community initiatives at this time.</p>
          </div>
        ) : (
          initiatives.map(initiative => {
            const progress = (initiative.currentFunding / initiative.fundingGoal) * 100;
            return (
              <div key={initiative.id} className="bg-white border border-[#CA9CE1]/20 rounded-2xl sm:rounded-[4rem] shadow-xl overflow-hidden flex flex-col group hover:shadow-2xl transition-all">
                <div className="p-5 sm:p-12 space-y-6 flex-grow">
                  <div className="flex justify-between items-start">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-[#7851A9] group-hover:text-white transition-all">
                      <BrandSubmark size={32} variant="BLACK" />
                    </div>
                    <div className="px-4 py-2 bg-[#7851A9]/10 text-[#7851A9] rounded-full text-[8px] font-black uppercase tracking-widest">Active Initiative</div>
                  </div>
                  
                  <h3 className="text-xl sm:text-3xl font-black italic uppercase tracking-tighter">{initiative.title}</h3>
                  <p className="text-slate-500 font-medium italic leading-relaxed">"{initiative.description || 'No description provided.'}"</p>
                  
                  <div className="space-y-3 pt-6">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-slate-400">Funding Progress</span>
                      <span className="text-[#7851A9]">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#7851A9] transition-all duration-1000" 
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm font-black italic tracking-tighter">
                      <span>${initiative.currentFunding.toLocaleString()}</span>
                      <span className="text-slate-300">Goal: ${initiative.fundingGoal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-10 bg-slate-50 border-t border-slate-100 space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Waive your discount to this project</p>
                  <div className="flex gap-2 sm:gap-4">
                    <div className="relative flex-grow">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-300">$</span>
                      <input 
                        type="number" 
                        placeholder="0.00"
                        value={waiveAmount[initiative.id] || ''}
                        onChange={e => setWaiveAmount({ ...waiveAmount, [initiative.id]: e.target.value })}
                        className="w-full p-3 sm:p-4 pl-8 bg-white border border-slate-200 rounded-xl sm:rounded-2xl font-bold outline-none focus:ring-4 focus:ring-[#7851A9]/10"
                      />
                    </div>
                    <button 
                      onClick={() => handleWaive(initiative.id)}
                      disabled={isProcessing !== null || !waiveAmount[initiative.id]}
                      className="bg-black text-white px-4 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] transition-all disabled:opacity-50"
                    >
                      {isProcessing === initiative.id ? '...' : 'Contribute'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
