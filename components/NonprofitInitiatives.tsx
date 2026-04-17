
import React, { useState } from 'react';
import { Plus, Target, Users, Calendar, ArrowRight, MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_INITIATIVES = [
  { id: 'i1', title: 'Community Garden Expansion', description: 'Adding 20 new raised beds and a composting station.', goal: 5000, current: 3200, supporters: 142, deadline: '2026-06-30', status: 'ACTIVE' },
  { id: 'i2', title: 'Youth Tech Workshop', description: 'Providing laptops and coding classes for local teens.', goal: 12000, current: 8500, supporters: 286, deadline: '2026-08-15', status: 'ACTIVE' },
  { id: 'i3', title: 'Senior Meal Program', description: 'Delivering healthy meals to homebound seniors.', goal: 3000, current: 3000, supporters: 98, deadline: '2026-03-01', status: 'COMPLETED' },
];

export const NonprofitInitiatives: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {MOCK_INITIATIVES.map((initiative) => (
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
              <button className="p-3 text-slate-300 hover:text-black transition-all">
                <MoreVertical size={20} />
              </button>
            </div>

            <p className="text-sm text-slate-500 font-medium mb-10 leading-relaxed italic">"{initiative.description}"</p>

            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Funding Progress</p>
                  <p className="text-xl font-black">${initiative.current.toLocaleString()} <span className="text-xs text-slate-300 font-medium">/ ${initiative.goal.toLocaleString()}</span></p>
                </div>
                <p className="text-sm font-black text-[#7851A9]">{Math.round((initiative.current / initiative.goal) * 100)}%</p>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(initiative.current / initiative.goal) * 100}%` }}
                  className="h-full bg-black rounded-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-10 pt-10 border-t border-slate-50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl">
                  <Users size={16} />
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Supporters</p>
                  <p className="text-sm font-black">{initiative.supporters}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <Calendar size={16} />
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Deadline</p>
                  <p className="text-sm font-black">{new Date(initiative.deadline).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
