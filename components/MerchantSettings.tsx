
import React, { useState, useEffect } from 'react';
import { merchantService } from '../services/merchantService';
import { Settings, User, CreditCard, Shield, Check, AlertCircle, ExternalLink, Zap, Lock, Globe } from 'lucide-react';
import { showToast } from '../hooks/toast';

export const MerchantSettings: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await merchantService.getProfile();
      setProfile(data);
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await merchantService.updateProfile(profile);
      showToast('Profile updated successfully.', 'success');
    } catch (err) {
      console.error('Failed to update profile', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStripeSetup = async () => {
    try {
      const { url } = await merchantService.setupStripe();
      window.location.href = url;
    } catch (err) {
      console.error('Failed to setup Stripe', err);
    }
  };

  if (loading) return <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-64 bg-slate-100 rounded-[3rem]" />)}</div>;

  if (!profile) return <div className="p-8 text-center text-slate-500">Could not load settings. Please refresh the page.</div>;
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-3xl font-black italic uppercase tracking-tighter">Merchant Node Settings.</h3>
          <p className="text-slate-400 text-xs font-medium mt-1">Configure your business profile, payment preferences, and data privacy.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleUpdate} className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-[#7851A9]">
                <User size={24} />
              </div>
              <h4 className="text-xl font-black italic uppercase tracking-tighter">Business Profile</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputBlock label="Business Name" value={profile.businessName} onChange={(v: any) => setProfile({...profile, businessName: v})} />
              <InputBlock label="Category" value={profile.category} onChange={(v: any) => setProfile({...profile, category: v})} />
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Business Description</label>
                <textarea 
                  value={profile.description} onChange={e => setProfile({...profile, description: e.target.value})}
                  rows={3} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none"
                />
              </div>
            </div>

            <div className="pt-8 border-t border-slate-50">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-[#7851A9]">
                  <Zap size={24} />
                </div>
                <h4 className="text-xl font-black italic uppercase tracking-tighter">Payment & Credit Preferences</h4>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#7851A9] shadow-sm">
                      <Shield size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase tracking-tight">Credit Acceptance</p>
                      <p className="text-[10px] font-medium text-slate-400">Allow customers to pay with platform credits.</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setProfile({...profile, creditAcceptance: profile.creditAcceptance === 'NONE' ? 'FULL' : 'NONE'})}
                    className={`w-14 h-8 rounded-full transition-all relative ${profile.creditAcceptance !== 'NONE' ? 'bg-[#7851A9]' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${profile.creditAcceptance !== 'NONE' ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>

                {profile.creditAcceptance !== 'NONE' && (
                  <div className="p-6 bg-white border border-slate-100 rounded-[2rem] space-y-4 animate-in slide-in-from-top-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Max Credit Percentage per Transaction</label>
                    <input 
                      type="range" min="0" max="100" step="5" value={profile.maxCreditPercentage} 
                      onChange={e => setProfile({...profile, maxCreditPercentage: parseInt(e.target.value)})}
                      className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-[#7851A9]"
                    />
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[#7851A9]">
                      <span>0%</span>
                      <span>{profile.maxCreditPercentage}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button 
              type="submit" disabled={isSaving}
              className="w-full py-6 bg-black text-white rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-[#7851A9] transition-all"
            >
              {isSaving ? 'Securing Node...' : 'Save All Preferences'}
            </button>
          </form>

          <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-[#7851A9]">
                <Globe size={24} />
              </div>
              <h4 className="text-xl font-black italic uppercase tracking-tighter">Data Cooperative</h4>
            </div>
            <div className="p-8 bg-slate-900 rounded-[3rem] text-white relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                <h5 className="text-lg font-black italic uppercase tracking-tighter">Opt-in to Collective Intelligence</h5>
                <p className="text-slate-400 text-xs font-medium">Share your anonymized transaction data to help the co-op negotiate better deals and improve Sentinel AI audits. All participating merchants benefit from collective insights that help reduce costs and optimize operations.</p>
                <div className="flex items-center gap-4 pt-4">
                  <button className="px-8 py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all">Opt-in Now</button>
                </div>
              </div>
              <div className="absolute -right-10 -bottom-10 opacity-10">
                <Globe size={150} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-[#7851A9]">
                <CreditCard size={24} />
              </div>
              <h4 className="text-xl font-black italic uppercase tracking-tighter">Payout Node</h4>
            </div>
            <div className="space-y-6">
              <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Stripe Connection</p>
                {profile.stripeAccountId ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <Check size={16} />
                      <span className="text-xs font-black uppercase tracking-widest">Connected</span>
                    </div>
                    <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black flex items-center gap-1">
                      Dashboard <ExternalLink size={12} />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={handleStripeSetup}
                    className="w-full py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] transition-all"
                  >
                    Connect Stripe
                  </button>
                )}
              </div>

              <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Payout Frequency</p>
                <select className="w-full bg-transparent text-sm font-black uppercase tracking-widest outline-none">
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
            <h4 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
              <Lock size={16} className="text-slate-400" /> Security Node
            </h4>
            <div className="space-y-4">
              <button className="w-full py-3 text-left px-4 hover:bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all">Change Password</button>
              <button className="w-full py-3 text-left px-4 hover:bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all">Two-Factor Auth</button>
              <button className="w-full py-3 text-left px-4 hover:bg-red-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 transition-all">Deactivate Merchant Node</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InputBlock = ({ label, value, onChange, placeholder, type = "text" }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{label}</label>
    <input 
      type={type} required value={value} onChange={e => onChange(e.target.value)}
      className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:bg-white focus:ring-4 focus:ring-[#7851A9]/10 transition-all"
      placeholder={placeholder}
    />
  </div>
);
