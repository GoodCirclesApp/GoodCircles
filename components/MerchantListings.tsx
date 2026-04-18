
import React, { useState, useEffect } from 'react';
import { Product, User } from '../types';
import { PRODUCT_CATEGORIES } from '../constants';
import { merchantService } from '../services/merchantService';
import { Plus, Search, Filter, MoreVertical, Edit2, Trash2, Check, X, Upload, Package, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const MerchantListings: React.FC = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    cogs: '',
    category: PRODUCT_CATEGORIES[0],
    type: 'PRODUCT' as 'PRODUCT' | 'SERVICE',
    imageUrl: 'https://picsum.photos/seed/product/400/400'
  });

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const data = await merchantService.getListings();
      setListings(data);
    } catch (err) {
      console.error('Failed to fetch listings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        cogs: parseFloat(formData.cogs)
      };
      if (editingId) {
        await merchantService.updateListing(editingId, payload);
      } else {
        await merchantService.createListing(payload);
      }
      setIsAdding(false);
      setEditingId(null);
      setFormData({ name: '', description: '', price: '', cogs: '', category: PRODUCT_CATEGORIES[0], type: 'PRODUCT', imageUrl: 'https://picsum.photos/seed/product/400/400' });
      fetchListings();
    } catch (err) {
      console.error('Failed to save listing', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this listing?')) return;
    try {
      await merchantService.deleteListing(id);
      fetchListings();
    } catch (err) {
      console.error('Failed to delete listing', err);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filteredListings = listings.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase()) &&
    (filter === 'ALL' || l.type === filter)
  );

  if (loading) return <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-3xl" />)}</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-3xl font-black italic uppercase tracking-tighter">Marketplace Assets</h3>
          <p className="text-slate-400 text-xs font-medium mt-1">Manage your {listings.length} active listings and verify their integrity.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" placeholder="Search listings..." 
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl text-base font-bold outline-none focus:ring-4 focus:ring-[#7851A9]/10 transition-all"
            />
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-black text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] shadow-xl transition-all flex items-center gap-2"
          >
            <Plus size={16} /> New Listing
          </button>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {['ALL', 'PRODUCT', 'SERVICE'].map(t => (
          <button 
            key={t} onClick={() => setFilter(t)}
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === t ? 'bg-black text-white' : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-300'}`}
          >
            {t}S
          </button>
        ))}
      </div>

      {selectedIds.length > 0 && (
        <div className="bg-[#7851A9] text-white p-4 rounded-2xl flex justify-between items-center animate-in slide-in-from-top-4">
          <p className="text-[10px] font-black uppercase tracking-widest">{selectedIds.length} items selected</p>
          <div className="flex gap-4">
            <button className="text-[10px] font-black uppercase tracking-widest hover:underline">Bulk Deactivate</button>
            <button className="text-[10px] font-black uppercase tracking-widest hover:underline">Change Category</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {filteredListings.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[4rem]">
            <p className="text-slate-400 font-bold italic">No matching listings found.</p>
          </div>
        ) : (
          filteredListings.map(l => (
            <div key={l.id} className={`bg-white p-4 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] border transition-all flex items-center gap-4 sm:gap-6 group ${selectedIds.includes(l.id) ? 'border-[#7851A9] ring-4 ring-[#7851A9]/5' : 'border-slate-100 hover:shadow-xl'}`}>
              <div 
                onClick={() => toggleSelect(l.id)}
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${selectedIds.includes(l.id) ? 'bg-[#7851A9] border-[#7851A9] text-white' : 'border-slate-200 group-hover:border-[#7851A9]'}`}
              >
                {selectedIds.includes(l.id) && <Check size={14} />}
              </div>
              <img src={l.imageUrl} className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-black truncate uppercase italic tracking-tighter">{l.name}</h4>
                  <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest ${l.type === 'PRODUCT' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                    {l.type}
                  </span>
                </div>
                <p className="text-[10px] font-black text-[#7851A9] uppercase mt-1">{l.category}</p>
              </div>
              <div className="hidden md:block text-right px-8 border-x border-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pricing</p>
                <p className="text-sm font-black italic">${l.price.toFixed(2)}</p>
                <p className="text-[10px] font-medium text-slate-400">COGS: ${l.cogs.toFixed(2)}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setEditingId(l.id);
                    setFormData({
                      name: l.name,
                      description: l.description || '',
                      price: l.price.toString(),
                      cogs: l.cogs.toString(),
                      category: l.category,
                      type: l.type,
                      imageUrl: l.imageUrl
                    });
                    setIsAdding(true);
                  }}
                  className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-black hover:text-white transition-all"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(l.id)}
                  className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 sm:p-6 bg-black/80 backdrop-blur-md">
            <motion.form 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onSubmit={handleSubmit} 
              className="bg-white w-full max-w-2xl rounded-none sm:rounded-[4rem] p-6 sm:p-12 md:p-16 space-y-6 sm:space-y-8 shadow-2xl border border-[#CA9CE1]/20 overflow-y-auto max-h-screen sm:max-h-[90vh]"
            >
              <header className="flex justify-between items-start">
                 <div>
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter">{editingId ? 'Refine Asset.' : 'New Asset Node.'}</h3>
                    <p className="text-slate-400 text-xs font-medium">Assets are audited by Sentinel AI for MSRP/COGS transparency.</p>
                 </div>
                 <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }} className="text-slate-300 hover:text-black transition-colors">
                    <X size={24} />
                 </button>
              </header>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Product Name</label>
                    <input 
                      required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none"
                      placeholder="e.g. Artisanal Espresso"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Market Taxonomy</label>
                    <select 
                      value={formData.category} 
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none"
                    >
                       {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Asset Type</label>
                    <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
                      <button 
                        type="button" onClick={() => setFormData({...formData, type: 'PRODUCT'})}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${formData.type === 'PRODUCT' ? 'bg-white text-black shadow-sm' : 'text-slate-400'}`}
                      >
                        <Package size={14} /> Product
                      </button>
                      <button 
                        type="button" onClick={() => setFormData({...formData, type: 'SERVICE'})}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${formData.type === 'SERVICE' ? 'bg-white text-black shadow-sm' : 'text-slate-400'}`}
                      >
                        <Calendar size={14} /> Service
                      </button>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">MSRP ($)</label>
                    <input 
                      type="number" step="0.01" inputMode="decimal" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                      className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none"
                      placeholder="0.00"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Cost of Goods (COGS)</label>
                    <input 
                      type="number" step="0.01" inputMode="decimal" required value={formData.cogs} onChange={e => setFormData({...formData, cogs: e.target.value})}
                      className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none"
                      placeholder="0.00"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Image Asset</label>
                    <div className="relative group">
                      <input 
                        type="text" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                        className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none pr-12"
                        placeholder="Image URL"
                      />
                      <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black">
                        <Upload size={18} />
                      </button>
                    </div>
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Listing Narrative</label>
                 <textarea 
                  required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  rows={3} 
                  className="w-full p-4 sm:p-6 bg-slate-50 border border-slate-100 rounded-[2rem] font-medium outline-none text-base" 
                  placeholder="Explain the utility of this asset..."
                 />
              </div>

              <button 
                type="submit" 
                className="w-full bg-black text-white py-6 rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-[#7851A9] transition-all"
              >
                {editingId ? 'Update Asset Node' : 'Deploy Asset Listing'}
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
