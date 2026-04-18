
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { showToast } from '../hooks/toast';

export const MerchantApprovals: React.FC = () => {
  const [pendingMerchants, setPendingMerchants] = useState<User[]>([]);

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('gc_mock_users') || '[]');
    setPendingMerchants(users.filter((u: User) => u.role === 'MERCHANT' && u.status === 'PENDING'));
  }, []);

  const handleUpdateStatus = (userId: string, newStatus: 'ACTIVE' | 'REJECTED') => {
    const users = JSON.parse(localStorage.getItem('gc_mock_users') || '[]');
    const updated = users.map((u: User) => u.id === userId ? { ...u, status: newStatus } : u);
    localStorage.setItem('gc_mock_users', JSON.stringify(updated));
    setPendingMerchants(prev => prev.filter(u => u.id !== userId));
    
    if (newStatus === 'ACTIVE') {
      showToast('Merchant account officially activated. Sentinel Credentials issued.', 'success');
    } else {
      showToast('Merchant application declined. Entity notified of compliance gaps.', 'info');
    }
  };

  return (
    <div className="bg-white rounded-[4rem] p-12 border border-[#CA9CE1]/20 shadow-sm space-y-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h3 className="text-3xl font-black italic uppercase tracking-tighter">Registration Queue</h3>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-accent">Awaiting Manual Verification</p>
      </div>
      <div className="grid grid-cols-1 gap-6">
        {pendingMerchants.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
             <p className="text-slate-400 font-bold italic">Queue Cleared. System integrity optimal.</p>
          </div>
        ) : (
          pendingMerchants.map(m => (
            <div key={m.id} className="p-10 bg-slate-50 border border-slate-100 rounded-[3rem] flex flex-col md:flex-row items-center justify-between group hover:border-[#7851A9]/30 transition-all shadow-sm gap-8">
              <div className="flex-1 space-y-4">
                <div>
                  <h4 className="text-2xl font-black uppercase tracking-tight italic">{m.name}</h4>
                  <p className="text-slate-500 font-medium text-xs">{m.email} | {m.businessWebsite || 'No Website'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 bg-white p-6 rounded-2xl border border-slate-100">
                   <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase">KYB Score</p>
                     <p className={`text-xl font-black italic ${m.kybScore && m.kybScore > 75 ? 'text-emerald-500' : 'text-amber-500'}`}>{m.kybScore || 0}%</p>
                   </div>
                   <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase">EIN Number</p>
                     <p className="text-sm font-bold text-black">{m.taxId || 'N/A'}</p>
                   </div>
                </div>

                <div className="p-4 bg-slate-100/50 rounded-xl">
                   <p className="text-[10px] font-black text-[#7851A9] uppercase tracking-widest font-accent italic">AI Audit Note</p>
                   <p className="text-[10px] text-slate-600 font-medium italic mt-1 leading-relaxed">"{m.kybNote || 'Initial digital footprint scan successful.'}"</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 shrink-0">
                <button 
                  onClick={() => handleUpdateStatus(m.id, 'ACTIVE')} 
                  className="bg-emerald-500 text-white px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl active:scale-95"
                >
                  Authorize Node
                </button>
                <button 
                  onClick={() => handleUpdateStatus(m.id, 'REJECTED')}
                  className="bg-white text-[#A20021] border border-[#A20021]/20 px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all"
                >
                  Reject & Notify
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
