import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Copy, Check, QrCode, Store, Sparkles, ArrowRight } from 'lucide-react';
import { BrandLogo, BrandSubmark } from './BrandAssets';

interface Props {
  merchantName: string;
  onClose: () => void;
}

type Tab = 'welcome' | 'digital' | 'instore' | 'firststeps';

const FIRST_STEPS = [
  { label: 'Add your first product or service listing', detail: 'Go to Merchant Portal → Marketplace Assets → New Listing' },
  { label: 'Complete your merchant profile', detail: 'Add your business description, hours, and contact info in Node Settings' },
  { label: 'Set up In-Person QR Pay', detail: 'Generate your QR code in the QR Pay tab for in-store transactions' },
  { label: 'Elect your nonprofit cause', detail: 'Choose which nonprofit receives 10% of your profits in Node Settings' },
  { label: 'Share your GoodCircles membership', detail: 'Post your digital badge and tell your customers what it means' },
];

export const MerchantWelcomeKit: React.FC<Props> = ({ merchantName, onClose }) => {
  const [tab, setTab] = useState<Tab>('welcome');
  const [copied, setCopied] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());

  const handleCopy = () => {
    navigator.clipboard.writeText('goodcircles-production.up.railway.app').catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleStep = (i: number) => {
    setCheckedSteps(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'welcome',    label: 'Welcome'      },
    { id: 'digital',    label: 'Digital Badge' },
    { id: 'instore',    label: 'In-Store Kit'  },
    { id: 'firststeps', label: 'First Steps'   },
  ];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[250] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

        <motion.div
          className="relative bg-white rounded-[2.5rem] overflow-hidden max-w-xl w-full shadow-2xl max-h-[90vh] flex flex-col"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        >
          {/* Header */}
          <div className="bg-black px-8 py-6 flex items-center justify-between shrink-0">
            <div>
              <p className="text-[9px] font-black text-[#C2A76F] uppercase tracking-[0.3em] mb-0.5">Welcome to the Movement</p>
              <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Your Merchant Kit.</h3>
            </div>
            <div className="flex items-center gap-4">
              <BrandSubmark size={40} color="#C2A76F" />
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <X size={15} className="text-white" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-100 shrink-0">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 py-3.5 text-[9px] font-black uppercase tracking-widest transition-all ${tab === t.id ? 'text-black border-b-2 border-black' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {tab === 'welcome' && (
                <motion.div key="welcome" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="p-8 space-y-6">
                  <div className="text-center space-y-3">
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                      className="inline-flex"
                    >
                      <Sparkles size={32} className="text-[#C2A76F]" />
                    </motion.div>
                    <h4 className="text-2xl font-black italic uppercase tracking-tighter text-black">
                      {merchantName ? `Welcome, ${merchantName}.` : 'Welcome to GoodCircles.'}
                    </h4>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
                      You've just joined a community of merchants who believe commerce can do more — for customers, for nonprofits, and for the neighborhood you call home.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: '10%', label: 'Consumer discount on every sale' },
                      { value: '10%', label: 'Of your profit to a local nonprofit' },
                      { value: '1%', label: 'Platform fee — no hidden charges' },
                    ].map((stat, i) => (
                      <div key={i} className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                        <p className="text-2xl font-black italic text-black">{stat.value}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1 leading-tight">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-[#7851A9]/5 border border-[#7851A9]/20 rounded-2xl p-5 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#7851A9]">What this means for you</p>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">
                      Every sale you make generates a community dividend. Your customers save money, your local nonprofit gets funded, and you build loyalty that no discount site can replicate — because your business stands for something.
                    </p>
                  </div>

                  <button onClick={() => setTab('digital')} className="w-full py-3.5 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] transition-all flex items-center justify-center gap-2">
                    Get Your Digital Badge <ArrowRight size={14} />
                  </button>
                </motion.div>
              )}

              {tab === 'digital' && (
                <motion.div key="digital" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="p-8 space-y-6">
                  <div>
                    <h4 className="text-base font-black italic uppercase tracking-tighter mb-1">Your Digital Member Badge</h4>
                    <p className="text-xs text-slate-500 font-medium">Share this on your website, social media, or email signature to show customers you're part of the ethical commerce network.</p>
                  </div>

                  {/* Badge preview */}
                  <div className="flex justify-center">
                    <div className="bg-black rounded-[2rem] p-8 flex flex-col items-center gap-4 w-64 border border-white/5 shadow-2xl">
                      <BrandLogo variant="GOLD" size="160px" />
                      <div className="w-full h-px bg-white/10" />
                      <div className="text-center space-y-1">
                        <p className="text-[9px] font-black text-[#C2A76F] uppercase tracking-[0.3em]">Proud Member</p>
                        <p className="text-xs font-black italic uppercase tracking-tighter text-white">Ethical Commerce Network</p>
                        <p className="text-[9px] text-white/40 font-medium">Central Mississippi Node</p>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-[#7851A9]/20 rounded-xl">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <p className="text-[9px] font-black text-[#CA9CE1] uppercase tracking-widest">Active & Verified</p>
                      </div>
                    </div>
                  </div>

                  {/* Share link */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your Platform Link</p>
                    <div className="flex gap-2">
                      <div className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-500 truncate">
                        goodcircles-production.up.railway.app
                      </div>
                      <button onClick={handleCopy} className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${copied ? 'bg-emerald-500 text-white' : 'bg-black text-white hover:bg-[#7851A9]'}`}>
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {['Website', 'Instagram', 'Email Sig'].map(platform => (
                      <button key={platform} className="py-2.5 border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:border-[#7851A9]/30 hover:text-[#7851A9] transition-all">
                        {platform}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {tab === 'instore' && (
                <motion.div key="instore" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="p-8 space-y-6">
                  <div>
                    <h4 className="text-base font-black italic uppercase tracking-tighter mb-1">In-Store Materials</h4>
                    <p className="text-xs text-slate-500 font-medium">Physical items that bridge your digital membership with your real-world business presence.</p>
                  </div>

                  {/* Window decal mockup */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Window Decal</p>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex items-center gap-5">
                      <div className="w-20 h-20 bg-[#7851A9]/10 border-2 border-[#7851A9]/30 border-dashed rounded-2xl flex flex-col items-center justify-center gap-1 flex-shrink-0">
                        <BrandSubmark size={28} color="#7851A9" />
                        <p className="text-[6px] font-black text-[#7851A9] uppercase tracking-wider text-center leading-tight">GoodCircles<br/>Member</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-black text-black">"Proud GoodCircles Merchant" Decal</p>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">3" × 3" vinyl decal for your storefront window. Lets customers know every purchase creates community impact.</p>
                        <button className="mt-2 px-4 py-1.5 border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:border-[#7851A9]/30 hover:text-[#7851A9] transition-all">
                          Request Decal →
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* QR tent card mockup */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">QR Payment Tent Card</p>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex items-center gap-5">
                      <div className="w-20 h-24 bg-black rounded-xl flex flex-col items-center justify-center gap-2 flex-shrink-0 p-2">
                        <QrCode size={28} className="text-white" />
                        <div className="w-full h-px bg-white/20" />
                        <p className="text-[6px] font-black text-[#C2A76F] uppercase tracking-wider text-center leading-tight">Scan to Pay<br/>GoodCircles</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-black text-black">QR Code Tent Card</p>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">4" × 6" folded card with your unique QR code for in-store payments via the GoodCircles wallet.</p>
                        <button className="mt-2 px-4 py-1.5 border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:border-[#7851A9]/30 hover:text-[#7851A9] transition-all">
                          Generate QR Card →
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-1">Coming at Launch</p>
                    <p className="text-xs text-amber-600 font-medium">Physical kit shipping activates after business registration. Digital versions are available now in the QR Pay tab.</p>
                  </div>
                </motion.div>
              )}

              {tab === 'firststeps' && (
                <motion.div key="firststeps" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="p-8 space-y-5">
                  <div>
                    <h4 className="text-base font-black italic uppercase tracking-tighter mb-1">Your First 5 Steps</h4>
                    <p className="text-xs text-slate-500 font-medium">Check these off to get your merchant node fully active.</p>
                  </div>

                  <div className="space-y-3">
                    {FIRST_STEPS.map((step, i) => {
                      const done = checkedSteps.has(i);
                      return (
                        <motion.button
                          key={i}
                          onClick={() => toggleStep(i)}
                          className={`w-full text-left flex items-start gap-3 p-4 rounded-2xl border transition-all ${done ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100 hover:border-[#7851A9]/20'}`}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                            {done && <CheckCircle2 size={12} className="text-white" />}
                          </div>
                          <div>
                            <p className={`text-sm font-black leading-snug ${done ? 'line-through text-slate-400' : 'text-black'}`}>{step.label}</p>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">{step.detail}</p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  {checkedSteps.size === FIRST_STEPS.length && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-[#7851A9] rounded-2xl p-5 text-center space-y-1"
                    >
                      <Sparkles size={20} className="text-[#C2A76F] mx-auto" />
                      <p className="text-sm font-black italic uppercase tracking-tighter text-white">Your node is fully active.</p>
                      <p className="text-[10px] text-white/60 font-medium">Welcome to the GoodCircles ecosystem.</p>
                    </motion.div>
                  )}

                  <button onClick={onClose} className="w-full py-3.5 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] transition-all">
                    Open Merchant Portal
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
