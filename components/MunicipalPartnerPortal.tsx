import React, { useState } from 'react';
import { ImpactDashboard } from './ImpactDashboard';
import { Shield, Lock, ExternalLink, Activity, MapPin } from 'lucide-react';

export const MunicipalPartnerPortal: React.FC = () => {
  const [token, setToken] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/municipal/dashboard', {
        headers: { 'x-municipal-token': token }
      });
      if (res.ok) {
        setIsAuthorized(true);
        setError('');
      } else {
        setError('Invalid or expired access token.');
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="bg-white rounded-[3rem] p-16 max-w-xl w-full border-2 border-black shadow-2xl space-y-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#7851A9]/5 rounded-full blur-3xl -mr-48 -mt-48"></div>
          
          <div className="space-y-4 relative z-10">
            <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center shadow-xl">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Municipal Partner Portal</h1>
            <p className="text-slate-500 font-medium max-w-sm">Access your regional impact dashboard using your secure municipal access token.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8 relative z-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Access Token</label>
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input 
                  type="password"
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  className="w-full pl-16 pr-8 py-6 rounded-2xl border-2 border-slate-100 bg-slate-50 outline-none font-bold focus:border-black transition-all"
                  placeholder="Enter your 64-character token"
                />
              </div>
              {error && <p className="text-xs font-bold text-[#A20021] ml-2">{error}</p>}
            </div>

            <button 
              type="submit"
              className="w-full py-6 rounded-2xl bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] shadow-2xl transition-all"
            >
              Authorize Access
            </button>
          </form>

          <div className="pt-8 border-t border-slate-100 flex items-center gap-4 text-slate-400">
            <Activity className="w-5 h-5" />
            <p className="text-[10px] font-black uppercase tracking-widest">Secure Municipal Gateway</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFE]">
      <nav className="bg-white border-b-2 border-black px-12 py-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Shield className="w-8 h-8 text-[#7851A9]" />
          <h2 className="text-xl font-black italic uppercase">Municipal Dashboard</h2>
        </div>
        <button 
          onClick={() => setIsAuthorized(false)}
          className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black transition-all"
        >
          Logout
        </button>
      </nav>
      <ImpactDashboard isMunicipal token={token} />
    </div>
  );
};
