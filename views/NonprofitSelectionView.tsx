
import React, { useState, useEffect } from 'react';
import { Nonprofit } from '../types';
import { neighborService } from '../services/neighborService';
import { useGoodCirclesStore } from '../hooks/useGoodCirclesStore';
import { BrandSubmark } from '../components/BrandAssets';
import { showToast } from '../hooks/toast';

interface Props {
  currentNonprofitId?: string;
  onSelect: (nonprofitId: string) => void;
}

export const NonprofitSelectionView: React.FC<Props> = ({ currentNonprofitId, onSelect }) => {
  const [nonprofits, setNonprofits] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSelecting, setIsSelecting] = useState<string | null>(null);

  useEffect(() => {
    const fetchNonprofits = async () => {
      try {
        const data = await neighborService.listNonprofits();
        setNonprofits(data);
      } catch (err) {
        console.error('Failed to fetch nonprofits:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNonprofits();
  }, []);

  const handleSelect = async (id: string) => {
    setIsSelecting(id);
    try {
      await neighborService.setElectedNonprofit(id);
      onSelect(id);
      const selected = nonprofits.find((n: any) => n.id === id);
      showToast(`✦ ${selected?.orgName ?? 'Cause'} is now your elected nonprofit`, 'success');
    } catch (err) {
      console.error('Failed to select nonprofit:', err);
      showToast('Failed to update selection. Please try again.', 'error');
    } finally {
      setIsSelecting(null);
    }
  };

  const filtered = nonprofits.filter(n => 
    n.orgName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (n.missionStatement && n.missionStatement.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <header className="max-w-3xl">
        <h2 className="text-7xl font-black text-black tracking-tighter italic uppercase leading-[0.9]">Choose Your Impact.</h2>
        <p className="text-slate-500 text-2xl font-medium mt-8">Select the verified nonprofit that will receive a portion of every purchase you make.</p>
      </header>

      <div className="relative max-w-2xl">
        <input 
          type="text" 
          placeholder="Search verified nonprofits by name or mission..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full p-8 pl-16 bg-white border border-[#CA9CE1]/30 rounded-[3rem] text-xl font-medium outline-none focus:ring-4 focus:ring-[#7851A9]/10 shadow-xl"
        />
        <svg className="w-8 h-8 absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-[4rem]"></div>
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-100 rounded-[4rem]">
            <p className="text-slate-400 font-bold italic">No nonprofits found matching your search.</p>
          </div>
        ) : (
          filtered.map(n => (
            <div key={n.id} className={`p-12 rounded-[4rem] border transition-all relative overflow-hidden group ${currentNonprofitId === n.id ? 'bg-black text-white border-black shadow-2xl scale-[1.02]' : 'bg-white text-black border-[#CA9CE1]/20 hover:shadow-2xl'}`}>
              <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-start">
                   <div>
                     <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${currentNonprofitId === n.id ? 'text-[#C2A76F]' : 'text-[#7851A9]'}`}>Verified Partner</p>
                     <h3 className="text-3xl font-black italic uppercase tracking-tighter">{n.orgName}</h3>
                   </div>
                   {currentNonprofitId === n.id && (
                     <div className="px-4 py-2 bg-[#C2A76F] text-black rounded-full text-[10px] font-black uppercase tracking-widest">Selected</div>
                   )}
                </div>
                
                <p className={`text-lg font-medium italic leading-relaxed ${currentNonprofitId === n.id ? 'text-white/70' : 'text-slate-500'}`}>"{n.missionStatement || 'No mission statement provided.'}"</p>
                
                <div className="pt-6 border-t border-current opacity-10"></div>
                
                <div className="flex items-end justify-between">
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${currentNonprofitId === n.id ? 'text-white/40' : 'text-slate-400'}`}>Total Platform Funding</p>
                    <p className={`text-4xl font-black italic tracking-tighter ${currentNonprofitId === n.id ? 'text-[#C2A76F]' : 'text-black'}`}>${n.totalFunding.toLocaleString()}</p>
                  </div>
                  
                  {currentNonprofitId !== n.id && (
                    <button 
                      onClick={() => handleSelect(n.id)}
                      disabled={isSelecting !== null}
                      className="bg-black text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] transition-all disabled:opacity-50"
                    >
                      {isSelecting === n.id ? 'Selecting...' : 'Select as my nonprofit'}
                    </button>
                  )}
                </div>
              </div>
              
              <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                <BrandSubmark size={200} variant={currentNonprofitId === n.id ? 'WHITE' : 'BLACK'} showCrown={true} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
