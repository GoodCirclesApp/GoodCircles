
import React, { useState } from 'react';
import { User } from '../types';
import { BrandSubmark } from './BrandAssets';

interface Props {
  user: User;
  impactScore: number;
}

export const ImpactBadgeGenerator: React.FC<Props> = ({ user, impactScore }) => {
  const [variant, setVariant] = useState<'GOLD' | 'DARK' | 'MINIMAL'>('GOLD');
  const badgeId = `gc-badge-${user.id}`;

  const getBadgeSVG = () => {
    const color = variant === 'GOLD' ? '#C2A76F' : variant === 'DARK' ? '#1A1A1A' : '#7851A9';
    const textColor = variant === 'GOLD' ? '#000' : '#FFF';
    
    return `<svg width="240" height="80" viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg">
  <rect width="240" height="80" rx="20" fill="${color}"/>
  <text x="80" y="35" font-family="Montserrat, sans-serif" font-weight="900" font-size="12" fill="${textColor}" style="text-transform:uppercase; letter-spacing:1px">Impact Verified</text>
  <text x="80" y="55" font-family="Montserrat, sans-serif" font-weight="900" font-size="18" fill="${textColor}" italic="true">Score: ${impactScore}</text>
  <circle cx="40" cy="40" r="25" fill="white" fill-opacity="0.1"/>
  <path d="M40 25 L35 35 L25 35 L32 45 L28 55 L40 48 L52 55 L48 45 L55 35 L45 35 Z" fill="${textColor}"/>
</svg>`;
  };

  const embedCode = `<a href="https://goodcircles.org/m/${user.id}" target="_blank">
  ${getBadgeSVG()}
</a>`;

  return (
    <div className="bg-white rounded-[4rem] p-12 border border-[#CA9CE1]/20 shadow-sm space-y-12 animate-in fade-in duration-500">
      <header>
        <h3 className="text-3xl font-black italic uppercase tracking-tighter">Impact Badge Engine</h3>
        <p className="text-slate-400 text-xs font-medium mt-1">Display your verified Good Circles status on your external website.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
           <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit">
              {(['GOLD', 'DARK', 'MINIMAL'] as const).map(v => (
                <button 
                  key={v} 
                  onClick={() => setVariant(v)}
                  className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${variant === v ? 'bg-white text-black shadow-sm' : 'text-slate-400'}`}
                >
                  {v}
                </button>
              ))}
           </div>

           <div className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 flex items-center justify-center min-h-[200px]">
              <div dangerouslySetInnerHTML={{ __html: getBadgeSVG() }} />
           </div>
        </div>

        <div className="space-y-6">
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">External Embed Code</label>
              <textarea 
                readOnly
                value={embedCode}
                className="w-full p-6 bg-slate-900 text-[#CA9CE1] font-mono text-[10px] rounded-2xl h-32 focus:ring-0 outline-none"
              />
           </div>
           <button 
             onClick={() => { navigator.clipboard.writeText(embedCode); alert("Embed code copied to clipboard."); }}
             className="w-full bg-black text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] transition-all"
           >
             Copy HTML Code
           </button>
           <p className="text-[9px] text-slate-400 font-medium italic leading-relaxed px-4 text-center">
             "Embed this badge on your footer or checkout page to signal your commitment to 10/10/1 community impact."
           </p>
        </div>
      </div>
    </div>
  );
};
