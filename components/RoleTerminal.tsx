
import React from 'react';
import { User, UserRole } from '../types';

interface Props {
  currentUser: User;
  impersonationRole: UserRole | null;
  setImpersonationRole: (role: UserRole | null) => void;
}

export const RoleTerminal: React.FC<Props> = ({ currentUser, impersonationRole, setImpersonationRole }) => {
  if (currentUser.role !== 'PLATFORM') return null;

  return (
    <div className="bg-slate-900 px-6 py-2 flex items-center justify-center gap-6 border-b border-white/5 animate-in slide-in-from-top duration-500">
      <span className="text-[10px] font-black text-[#C2A76F] uppercase tracking-[0.3em] font-accent">Role Terminal:</span>
      <div className="flex gap-2">
        <button 
          onClick={() => setImpersonationRole(null)} 
          className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!impersonationRole ? 'bg-[#C2A76F] text-black' : 'text-slate-400 hover:text-white'}`}
        >
          Master View
        </button>
        <button 
          onClick={() => setImpersonationRole('NEIGHBOR')} 
          className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${impersonationRole === 'NEIGHBOR' ? 'bg-white text-black' : 'text-slate-400 hover:text-white'}`}
        >
          Neighbor
        </button>
        <button 
          onClick={() => setImpersonationRole('MERCHANT')} 
          className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${impersonationRole === 'MERCHANT' ? 'bg-white text-black' : 'text-slate-400 hover:text-white'}`}
        >
          Merchant
        </button>
        <button 
          onClick={() => setImpersonationRole('NONPROFIT')} 
          className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${impersonationRole === 'NONPROFIT' ? 'bg-white text-black' : 'text-slate-400 hover:text-white'}`}
        >
          Nonprofit
        </button>
      </div>
    </div>
  );
};
