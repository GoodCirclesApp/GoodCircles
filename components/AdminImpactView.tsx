import React, { useState, useEffect } from 'react';
import { ImpactDashboard } from './ImpactDashboard';
import { Shield, Activity, Lock } from 'lucide-react';
import { showToast } from '../hooks/toast';

export const AdminImpactView: React.FC = () => {
  const [regions, setRegions] = useState<any[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showActivateModal, setShowActivateModal] = useState<string | null>(null);
  const [activationForm, setActivationForm] = useState({ name: '', email: '' });

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      const token = localStorage.getItem('gc_auth_token');
      const res = await fetch('/api/admin/impact/regions', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (!res.ok) throw new Error('Server error');
      
      const data = await res.json();
      // Safety check: ensure we always have an array
      setRegions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch regions:', err);
      setRegions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (regionId: string) => {
    try {
      const token = localStorage.getItem('gc_auth_token');
      const res = await fetch(`/api/admin/impact/municipal/${regionId}/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(activationForm)
      });
      if (res.ok) {
        const result = await res.json();
        showToast(`Partnership activated! Token: ${result.token}`, 'success');
        setShowActivateModal(null);
        setActivationForm({ name: '', email: '' });
        fetchRegions();
      }
    } catch (err) {
      showToast('Failed to activate. Check console for details.', 'error');
    }
  };

  if (loading) return <div className="p-12 text-center font-black uppercase animate-pulse">Loading Admin Impact...</div>;

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-12 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-black tracking-tighter italic uppercase">Regional Admin</h1>
          <p className="text-slate-500 font-medium">Manage regions and monitor impact.</p>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => setSelectedRegionId(null)}
            className={`px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase ${!selectedRegionId ? 'bg-[#7851A9] text-white' : 'bg-white border-2 border-black'}`}
          >
            Platform-Wide
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar: Regions List */}
        <div className="lg:col-span-1 space-y-8">
          <h2 className="text-2xl font-black italic uppercase">Regions</h2>
          <div className="space-y-4">
            {regions.length === 0 ? (
              <p className="text-slate-400 text-sm">No regions found.</p>
            ) : (
              regions.map(region => (
                <div 
                  key={region?.id || Math.random()} 
                  onClick={() => setSelectedRegionId(region?.id)}
                  className={`bg-white border-2 rounded-[2rem] p-6 cursor-pointer transition-all ${selectedRegionId === region?.id ? 'border-[#7851A9]' : 'border-black'}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-black uppercase">{region?.name || 'Unnamed Region'}</h3>
                      <p className="text-[10px] text-slate-400">{region?.cityName || 'Unknown City'}</p>
                    </div>
                    {region?.partner?.isActive ? <Shield className="text-emerald-500" /> : <Lock className="text-slate-300" />}
                  </div>
                  
                  {/* Safety-wrapped metrics */}
                  <div className="flex justify-between pt-4 border-t mt-4">
                    <div className="text-center flex-1">
                      <p className="text-[10px] uppercase text-slate-400">Merchants</p>
                      <p className="font-black">{region?.metrics?.[0]?.merchantsActive || 0}</p>
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-[10px] uppercase text-slate-400">GTV</p>
                      <p className="font-black">${Math.round((region?.metrics?.[0]?.totalGtv || 0) / 1000)}k</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Dashboard Section */}
        <div className="lg:col-span-3 bg-slate-50 rounded-[2rem] p-4 min-h-[400px]">
          {/* We only show the dashboard if we aren't loading, to prevent crashes */}
          <ImpactDashboard regionId={selectedRegionId || undefined} />
        </div>
      </div>
    </div>
  );
};
