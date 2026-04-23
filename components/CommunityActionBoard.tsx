import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, ShoppingCart, Heart, Calendar, Lightbulb, CheckCircle2, X } from 'lucide-react';
import { BrandSubmark } from './BrandAssets';

type ActionType = 'GROUP_PURCHASE' | 'FUNDRAISE' | 'EVENT' | 'INITIATIVE';
type ActionStatus = 'FORMING' | 'ACTIVE' | 'COMPLETED';
type FilterType = 'ALL' | ActionType;

interface CommunityAction {
  id: string;
  title: string;
  type: ActionType;
  description: string;
  proposedBy: string;
  supporters: number;
  goal: string;
  status: ActionStatus;
  daysLeft?: number;
}

const SEED_ACTIONS: CommunityAction[] = [
  {
    id: 'a1',
    title: 'Bulk Order: Local Produce Co-Op',
    type: 'GROUP_PURCHASE',
    description: 'Pool orders from 20+ families to unlock wholesale pricing from Farm Fresh Collective. Each household saves ~$40/month on groceries.',
    proposedBy: 'Sarah M.',
    supporters: 14,
    goal: '20 households',
    status: 'FORMING',
    daysLeft: 5,
  },
  {
    id: 'a2',
    title: 'Pearl River Trail Cleanup Day',
    type: 'EVENT',
    description: 'Coordinated cleanup with volunteer registration, tool sharing, and a post-event meal hosted by The Harvest Table. All supplies funded by Green Cleanup Initiative.',
    proposedBy: 'James T.',
    supporters: 31,
    goal: '50 volunteers',
    status: 'ACTIVE',
    daysLeft: 12,
  },
  {
    id: 'a3',
    title: 'Legal Aid Fund for Small Businesses',
    type: 'FUNDRAISE',
    description: 'Pool community resources to pre-fund one hour of legal consultation for 10 small businesses facing lease negotiations through Justice Partners Legal.',
    proposedBy: 'David K.',
    supporters: 8,
    goal: '$500 target',
    status: 'FORMING',
    daysLeft: 9,
  },
  {
    id: 'a4',
    title: 'Back-to-School Supply Drive',
    type: 'INITIATIVE',
    description: 'Coordinate donations of school supplies through Youth Scholars Alliance merchant partners before the fall semester begins.',
    proposedBy: 'Dr. Patricia O.',
    supporters: 47,
    goal: '100 supply kits',
    status: 'COMPLETED',
  },
  {
    id: 'a5',
    title: 'Merchant Block Discount Week',
    type: 'GROUP_PURCHASE',
    description: 'Organize a community shopping week where 5+ merchants offer stacked GoodCircles discounts. Coordinated through the platform to maximize nonprofit impact.',
    proposedBy: 'Marco V.',
    supporters: 22,
    goal: '30 participating merchants',
    status: 'ACTIVE',
    daysLeft: 3,
  },
];

const TYPE_CONFIG: Record<ActionType, { label: string; icon: typeof ShoppingCart; color: string; bg: string }> = {
  GROUP_PURCHASE: { label: 'Group Purchase', icon: ShoppingCart, color: 'text-[#C2A76F]', bg: 'bg-amber-50' },
  FUNDRAISE:      { label: 'Fundraise',      icon: Heart,        color: 'text-rose-500',  bg: 'bg-rose-50'   },
  EVENT:          { label: 'Event',           icon: Calendar,     color: 'text-[#7851A9]', bg: 'bg-[#7851A9]/10' },
  INITIATIVE:     { label: 'Initiative',      icon: Lightbulb,    color: 'text-emerald-600', bg: 'bg-emerald-50' },
};

const STATUS_CONFIG: Record<ActionStatus, { label: string; dot: string }> = {
  FORMING:   { label: 'Forming',   dot: 'bg-amber-400' },
  ACTIVE:    { label: 'Active',    dot: 'bg-emerald-500' },
  COMPLETED: { label: 'Completed', dot: 'bg-[#7851A9]' },
};

interface NewActionForm {
  title: string;
  type: ActionType;
  description: string;
  goal: string;
}

export const CommunityActionBoard: React.FC = () => {
  const [actions, setActions] = useState<CommunityAction[]>(SEED_ACTIONS);
  const [supported, setSupported] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewActionForm>({ title: '', type: 'INITIATIVE', description: '', goal: '' });

  const toggleSupport = (id: string) => {
    setSupported(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setActions(prev => prev.map(a => a.id === id
      ? { ...a, supporters: supported.has(id) ? a.supporters - 1 : a.supporters + 1 }
      : a
    ));
  };

  const submitAction = () => {
    if (!form.title.trim() || !form.description.trim()) return;
    const newAction: CommunityAction = {
      id: `user-${Date.now()}`,
      title: form.title,
      type: form.type,
      description: form.description,
      proposedBy: 'You',
      supporters: 1,
      goal: form.goal || 'Community driven',
      status: 'FORMING',
      daysLeft: 14,
    };
    setActions(prev => [newAction, ...prev]);
    setSupported(prev => new Set([...prev, newAction.id]));
    setForm({ title: '', type: 'INITIATIVE', description: '', goal: '' });
    setShowForm(false);
  };

  const filtered = filter === 'ALL' ? actions : actions.filter(a => a.type === filter);

  return (
    <div className="h-full flex flex-col bg-white rounded-[4rem] border border-[#CA9CE1]/20 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-7 bg-black text-white relative overflow-hidden shrink-0">
        <div className="relative z-10 flex items-start justify-between">
          <div className="space-y-0.5">
            <p className="text-[9px] font-black text-[#C2A76F] uppercase tracking-[0.4em]">Community Coordination</p>
            <h4 className="text-xl font-black italic uppercase tracking-tighter">Action Board.</h4>
            <p className="text-[10px] text-white/40 font-medium pt-1">Propose and coordinate local actions</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#7851A9] rounded-xl text-[9px] font-black uppercase tracking-widest text-white hover:bg-[#6a3f9a] transition-all"
          >
            <Plus size={12} />
            Propose
          </button>
        </div>
        <div className="absolute top-0 right-0 p-5 opacity-10">
          <BrandSubmark size={45} variant="WHITE" showCrown={false} />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-3 border-b border-slate-50 shrink-0 overflow-x-auto">
        {(['ALL', 'GROUP_PURCHASE', 'EVENT', 'FUNDRAISE', 'INITIATIVE'] as FilterType[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${filter === f ? 'bg-black text-white' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
          >
            {f === 'ALL' ? 'All' : TYPE_CONFIG[f].label}
          </button>
        ))}
      </div>

      {/* Action list */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        <AnimatePresence initial={false}>
          {filtered.map(action => {
            const typeConf = TYPE_CONFIG[action.type];
            const statusConf = STATUS_CONFIG[action.status];
            const Icon = typeConf.icon;
            const isSupported = supported.has(action.id);

            return (
              <motion.div
                key={action.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-slate-50 rounded-[1.5rem] p-4 border border-slate-100 hover:border-[#CA9CE1]/30 transition-all"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-xl ${typeConf.bg} ${typeConf.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={13} />
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${typeConf.color}`}>{typeConf.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${statusConf.dot} ${action.status === 'ACTIVE' ? 'animate-pulse' : ''}`} />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{statusConf.label}</span>
                  </div>
                </div>

                <h5 className="text-sm font-black text-black leading-snug mb-1">{action.title}</h5>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-3">{action.description}</p>

                {/* Meta row */}
                <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">
                  <span>By {action.proposedBy}</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><Users size={9} />{action.supporters}</span>
                    {action.daysLeft != null && <span>{action.daysLeft}d left</span>}
                  </div>
                </div>

                {/* Goal + Support */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-1.5 bg-white rounded-xl border border-slate-100">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Goal: </span>
                    <span className="text-[9px] font-black text-black">{action.goal}</span>
                  </div>
                  {action.status !== 'COMPLETED' && (
                    <button
                      onClick={() => toggleSupport(action.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                        isSupported
                          ? 'bg-[#7851A9] text-white'
                          : 'bg-white border border-slate-200 text-slate-500 hover:border-[#7851A9]/30 hover:text-[#7851A9]'
                      }`}
                    >
                      {isSupported ? <CheckCircle2 size={10} /> : <Plus size={10} />}
                      {isSupported ? 'Supporting' : 'Support'}
                    </button>
                  )}
                  {action.status === 'COMPLETED' && (
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-[#7851A9]/10 text-[#7851A9]">
                      <CheckCircle2 size={10} />
                      Done
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Propose modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="absolute inset-0 z-50 flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
            <motion.div
              className="relative w-full bg-white rounded-t-[3rem] p-7 space-y-4 shadow-2xl"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center justify-between mb-1">
                <h5 className="text-base font-black italic uppercase tracking-tighter">Propose Action</h5>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                  <X size={14} />
                </button>
              </div>

              <input
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#7851A9]/20"
                placeholder="Action title..."
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />

              <select
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#7851A9]/20"
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value as ActionType }))}
              >
                {(Object.keys(TYPE_CONFIG) as ActionType[]).map(t => (
                  <option key={t} value={t}>{TYPE_CONFIG[t].label}</option>
                ))}
              </select>

              <textarea
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#7851A9]/20 resize-none"
                placeholder="Describe the community action..."
                rows={3}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />

              <input
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#7851A9]/20"
                placeholder="Goal (e.g. 20 households, $500 target)..."
                value={form.goal}
                onChange={e => setForm(f => ({ ...f, goal: e.target.value }))}
              />

              <button
                onClick={submitAction}
                disabled={!form.title.trim() || !form.description.trim()}
                className="w-full py-3.5 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] transition-all disabled:opacity-30"
              >
                Post to Community Board
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
