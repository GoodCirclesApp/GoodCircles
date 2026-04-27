
import React, { useState, useEffect } from 'react';
import { Plus, Users, ArrowRight, MoreVertical, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiClient } from '../services/apiClient';

interface Initiative {
  id: string;
  title: string;
  description: string;
  goal: number;
  current: number;
  supporters: number;
  status: 'ACTIVE' | 'COMPLETED';
}

export const NonprofitInitiatives: React.FC = () => {
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', goal: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await apiClient.get<Initiative[]>('/nonprofit/initiatives');
      setInitiatives(data);
    } catch {
      setInitiatives([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.title || !form.goal) return;
    setSaving(true);
    setError(null);
    try {
      await apiClient.post('/nonprofit/initiatives', {
        title: form.title,
        description: form.description,
        goal: parseFloat(form.goal),
      });
      setForm({ title: '', description: '', goal: '' });
      setIsCreating(false);
      load();
    } catch (e: any) {
      setError(e.message || 'Failed to create initiative.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black italic uppercase tracking-tighter">Community Initiatives</h3>
          <p className="text-slate-400 text-xs font-medium">Direct funding for specific local projects</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-black text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-[#7851A9] transition-all flex items-center gap-2"
        >
          <Plus size={16} />
          New Initiative
        </button>
      </div>

      {/* Create Form Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-8 space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="text-xl font-black italic uppercase tracking-tighter">New Initiative</h4>
              <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={18} /></button>
            </div>
            {error && <p className="text-xs text-rose-600 font-bold px-4 py-2 bg-rose-50 rounded-xl">{error}</p>}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Title</label>
              <input className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7851A9]/20" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Community Garden Expansion" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
              <textarea className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7851A9]/20 resize-none" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="What will this initiative accomplish?" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Funding Goal ($)</label>
              <input type="number" min="1" step="0.01" className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7851A9]/20" value={form.goal} onChange={e => setForm(p => ({ ...p, goal: e.target.value }))} placeholder="5000" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setIsCreating(false)} className="flex-1 py-3 rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
              <button onClick={handleCreate} disabled={saving || !form.title || !form.goal} className="flex-1 py-3 rounded-xl bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] transition-all disabled:opacity-50">{saving ? 'Creating…' : 'Create Initiative'}</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {[1, 2].map(i => <div key={i} className="h-64 bg-slate-50 rounded-[3.5rem] animate-pulse" />)}
        </div>
      ) : initiatives.length === 0 ? (
        <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
          <p className="text-slate-400 font-bold text-lg">No initiatives yet.</p>
          <p className="text-slate-300 text-sm font-medium mt-2">Create your first initiative to start directing donations to specific projects.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {initiatives.map((initiative) => (
            <div key={initiative.id} className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
              <div className="flex justify-between items-start mb-8">
                <div className="space-y-2">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    initiative.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {initiative.status}
                  </span>
                  <h4 className="text-2xl font-black italic uppercase tracking-tighter group-hover:text-[#7851A9] transition-colors">{initiative.title}</h4>
                </div>
              </div>

              {initiative.description && (
                <p className="text-sm text-slate-500 font-medium mb-10 leading-relaxed italic">"{initiative.description}"</p>
              )}

              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Funding Progress</p>
                    <p className="text-xl font-black">${initiative.current.toLocaleString()} <span className="text-xs text-slate-300 font-medium">/ ${initiative.goal.toLocaleString()}</span></p>
                  </div>
                  <p className="text-sm font-black text-[#7851A9]">{Math.min(100, Math.round((initiative.current / (initiative.goal || 1)) * 100))}%</p>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (initiative.current / (initiative.goal || 1)) * 100)}%` }}
                    className="h-full bg-black rounded-full"
                  />
                </div>
              </div>

              <div className="mt-10 pt-10 border-t border-slate-50 flex items-center gap-4">
                <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl">
                  <Users size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Supporters</p>
                  <p className="text-sm font-black">{initiative.supporters}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
