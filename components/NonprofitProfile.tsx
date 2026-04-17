
import React, { useState } from 'react';
import { Save, Globe, Mail, Phone, MapPin, Camera, ExternalLink } from 'lucide-react';
import { useGoodCirclesStore } from '../hooks/useGoodCirclesStore';

export const NonprofitProfile: React.FC = () => {
  const { currentUser, updateUser } = useGoodCirclesStore();
  const [formData, setFormData] = useState({
    orgName: currentUser?.firstName || '',
    mission: 'Empowering local communities through sustainable growth and shared resources.',
    website: 'https://goodcircles.org',
    email: currentUser?.email || '',
    phone: '(555) 123-4567',
    address: '123 Impact Way, Suite 100, San Francisco, CA 94103',
  });

  const handleSave = async () => {
    try {
      await updateUser({ firstName: formData.orgName });
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-16 opacity-5">
          <Globe size={200} />
        </div>
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="relative group cursor-pointer">
            <div className="w-32 h-32 bg-slate-100 rounded-full border-4 border-white shadow-xl overflow-hidden">
              <img src={`https://picsum.photos/seed/${formData.orgName}/200/200`} className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
              <Camera className="text-white" size={24} />
            </div>
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2">{formData.orgName}</h3>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Verified Impact Partner</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Organization Name</label>
            <input 
              type="text" 
              value={formData.orgName}
              onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
              className="w-full px-8 py-5 bg-white border border-slate-100 rounded-3xl text-sm font-bold focus:ring-2 focus:ring-[#7851A9] transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Mission Statement</label>
            <textarea 
              rows={4}
              value={formData.mission}
              onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
              className="w-full px-8 py-5 bg-white border border-slate-100 rounded-3xl text-sm font-bold focus:ring-2 focus:ring-[#7851A9] transition-all resize-none italic"
            />
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Website URL</label>
            <div className="relative">
              <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="url" 
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full pl-16 pr-8 py-5 bg-white border border-slate-100 rounded-3xl text-sm font-bold focus:ring-2 focus:ring-[#7851A9] transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Contact Email</label>
            <div className="relative">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-16 pr-8 py-5 bg-white border border-slate-100 rounded-3xl text-sm font-bold focus:ring-2 focus:ring-[#7851A9] transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="tel" 
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-16 pr-8 py-5 bg-white border border-slate-100 rounded-3xl text-sm font-bold focus:ring-2 focus:ring-[#7851A9] transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <MapPin className="text-[#7851A9]" size={24} />
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-tight">Physical Address</h4>
            <p className="text-xs text-slate-400 font-medium">{formData.address}</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          className="bg-black text-white px-12 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-[#7851A9] transition-all flex items-center gap-3"
        >
          <Save size={16} />
          Save Profile
        </button>
      </div>
    </div>
  );
};
