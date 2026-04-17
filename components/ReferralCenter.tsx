
import React, { useState } from 'react';
import { User } from '../types';
import { BrandSubmark } from './BrandAssets';

interface Props {
  user: User;
  onReferralSubmit: (bizName: string) => void;
}

export const ReferralCenter: React.FC<Props> = ({ user, onReferralSubmit }) => {
  const [bizName, setBizName] = useState('');
  const [bizEmail, setBizEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onReferralSubmit(bizName);
      setIsSubmitting(false);
      setSuccess(true);
      setBizName('');
      setBizEmail('');
      setTimeout(() => setSuccess(false), 5000);
    }, 1500);
  };

  return (
    <div className="bg-black text-white rounded-[4rem] p-12 md:p-16 shadow-2xl relative overflow-hidden group animate-in slide-in-from-bottom-8">
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8 text-center lg:text-left">
          <div className="flex items-center gap-4 justify-center lg:justify-start">
             <div className="p-3 bg-[#7851A9] rounded-2xl"><BrandSubmark size={32} variant="WHITE" showCrown={false} /></div>
             <h3 className="text-4xl font-black italic uppercase tracking-tighter">Expand the Circle.</h3>
          </div>
          <p className="text-[#CA9CE1] text-xl font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
            Invite your favorite local businesses to join Good Circles. Each successful node acquisition increases your 10% purchasing power.
          </p>
          <div className="flex items-center gap-10 justify-center lg:justify-start">
             <div>
                <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Successful Referrals</p>
                <p className="text-3xl font-black italic text-[#C2A76F]">{user.referralCount || 0}</p>
             </div>
             <div>
                <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Impact Multiplier</p>
                <p className="text-3xl font-black italic text-emerald-400">1.{(user.referralCount || 0)}x</p>
             </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 shadow-inner">
          {success ? (
            <div className="py-10 text-center space-y-6 animate-in zoom-in duration-500">
               <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl"><svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg></div>
               <h4 className="text-2xl font-black italic uppercase tracking-tighter">Referral Captured</h4>
               <p className="text-slate-400 text-sm font-medium">Sentinel AI has added this entity to the prospect queue.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-2">Business Name</label>
                <input 
                  required
                  value={bizName}
                  onChange={(e) => setBizName(e.target.value)}
                  className="w-full p-5 bg-white/10 rounded-2xl border border-white/10 outline-none text-sm font-bold focus:bg-white/20 transition-all"
                  placeholder="e.g. Blue Bottle Coffee"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-2">Owner / Contact Email</label>
                <input 
                  required
                  type="email"
                  value={bizEmail}
                  onChange={(e) => setBizEmail(e.target.value)}
                  className="w-full p-5 bg-white/10 rounded-2xl border border-white/10 outline-none text-sm font-bold focus:bg-white/20 transition-all"
                  placeholder="hello@bluebottle.com"
                />
              </div>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#C2A76F] text-black py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-2xl active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? 'Acquiring Node...' : 'Acquire Business Node'}
              </button>
            </form>
          )}
        </div>
      </div>
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#7851A9]/10 blur-[100px] -mr-40 -mt-40 group-hover:scale-150 transition-transform duration-1000"></div>
    </div>
  );
};
