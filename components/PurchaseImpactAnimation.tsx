import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isVisible: boolean;
  onClose: () => void;
  grossAmount: number;
  merchantNet: number;
  discountAmount: number;
  nonprofitDonation: number;
  nonprofitName: string;
  nonprofitMission: string;
}

function useCountUp(target: number, durationMs: number, active: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active || target === 0) { setValue(0); return; }
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setValue(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs, active]);
  return value;
}

const CONFETTI_PIECES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  color: ['#C2A76F', '#7851A9', '#22c55e', '#fbbf24', '#e2e8f0', '#a78bfa'][i % 6],
  x: (Math.random() - 0.5) * 360,
  y: -(60 + Math.random() * 180),
  rotation: Math.random() * 720 - 360,
  scale: 0.3 + Math.random() * 0.7,
  delay: Math.random() * 0.5,
  shape: i % 3 === 0 ? 'circle' : i % 3 === 1 ? 'square' : 'diamond',
}));

// Stream SVG paths — endpoints align with card-column centers in a 600-unit viewBox
// Col centers: 100 (merchant), 300 (discount), 500 (nonprofit)
const STREAM_PATH_MERCHANT  = 'M 300 0 C 300 88 100 88 100 178';
const STREAM_PATH_DISCOUNT  = 'M 300 0 C 300 88 300 88 300 178';
const STREAM_PATH_NONPROFIT = 'M 300 0 C 300 88 500 88 500 178';

export const PurchaseImpactAnimation: React.FC<Props> = ({
  isVisible,
  onClose,
  grossAmount,
  merchantNet,
  discountAmount,
  nonprofitDonation,
  nonprofitName,
  nonprofitMission,
}) => {
  const [phase, setPhase] = useState<
    'IDLE' | 'HUB' | 'STREAMS' | 'CARDS' | 'IMPACT' | 'COMPLETE'
  >('IDLE');
  const [showConfetti, setShowConfetti] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const countActive = phase === 'IMPACT' || phase === 'COMPLETE';
  const merchantCount   = useCountUp(merchantNet,       900, countActive);
  const discountCount   = useCountUp(discountAmount,    900, countActive);
  const nonprofitCount  = useCountUp(nonprofitDonation, 900, countActive);

  useEffect(() => {
    if (!isVisible) {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      setPhase('IDLE');
      setShowConfetti(false);
      return;
    }
    const add = (fn: () => void, ms: number) => {
      const t = setTimeout(fn, ms);
      timersRef.current.push(t);
    };
    add(() => setPhase('HUB'),      400);
    add(() => setPhase('STREAMS'),  950);
    add(() => setPhase('CARDS'),    1800);
    add(() => setPhase('IMPACT'),   2400);
    add(() => setShowConfetti(true),3100);
    add(() => setPhase('COMPLETE'), 3200);
  }, [isVisible]);

  const fmt = (n: number) => `$${n.toFixed(2)}`;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/75"
            style={{ backdropFilter: 'blur(12px)' }}
            onClick={phase === 'COMPLETE' ? onClose : undefined}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            initial={{ scale: 0.88, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.05 }}
          >
            {/* Top gradient bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#7851A9] via-[#C2A76F] to-[#22c55e]" />

            <div className="px-6 pt-8 pb-10 space-y-0">

              {/* Header */}
              <AnimatePresence>
                {phase !== 'IDLE' && (
                  <motion.div
                    className="text-center mb-6"
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#C2A76F]">✦ Your Impact ✦</p>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-black mt-1">
                      Every Dollar Counts.
                    </h2>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Hub */}
              <div className="flex justify-center mb-0">
                <AnimatePresence>
                  {(phase === 'HUB' || phase === 'STREAMS' || phase === 'CARDS' || phase === 'IMPACT' || phase === 'COMPLETE') && (
                    <motion.div
                      className="relative flex flex-col items-center"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                    >
                      {/* Pulsing rings */}
                      {(phase === 'HUB' || phase === 'STREAMS') && (
                        <>
                          <motion.div
                            className="absolute inset-0 rounded-full border-2 border-[#C2A76F]/40"
                            animate={{ scale: [1, 1.7], opacity: [0.6, 0] }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
                          />
                          <motion.div
                            className="absolute inset-0 rounded-full border border-[#C2A76F]/25"
                            animate={{ scale: [1, 2.1], opacity: [0.4, 0] }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
                          />
                        </>
                      )}
                      <div className="relative z-10 bg-black text-white rounded-full w-28 h-28 flex flex-col items-center justify-center shadow-2xl">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#C2A76F] mb-0.5">Total</span>
                        <span className="text-2xl font-black italic tracking-tighter">{fmt(grossAmount)}</span>
                      </div>
                      <motion.p
                        className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mt-3"
                        animate={phase === 'STREAMS' ? { opacity: [0.4, 1, 0.4] } : { opacity: 0.6 }}
                        transition={{ duration: 1.4, repeat: phase === 'STREAMS' ? Infinity : 0 }}
                      >
                        {phase === 'STREAMS' ? 'Splitting...' : 'Split'}
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* SVG Streams */}
              <div className="relative -mt-4" style={{ height: 190 }}>
                <svg
                  viewBox="0 0 600 190"
                  className="w-full h-full"
                  style={{ overflow: 'visible' }}
                >
                  <defs>
                    <filter id="glow-merchant" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                    <filter id="glow-discount" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="3.5" result="blur" />
                      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                    <filter id="glow-nonprofit" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                    {/* Named paths for animateMotion */}
                    <path id="mp" d={STREAM_PATH_MERCHANT} />
                    <path id="dp" d={STREAM_PATH_DISCOUNT} />
                    <path id="np" d={STREAM_PATH_NONPROFIT} />
                  </defs>

                  {(phase === 'STREAMS' || phase === 'CARDS' || phase === 'IMPACT' || phase === 'COMPLETE') && (
                    <>
                      {/* Merchant stream */}
                      <motion.path
                        d={STREAM_PATH_MERCHANT}
                        stroke="#334155" strokeWidth="2.5" fill="none" strokeLinecap="round"
                        filter="url(#glow-merchant)"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.85, ease: [0.4, 0, 0.2, 1] }}
                      />
                      {/* Merchant particles */}
                      {[0, 0.35, 0.7].map((delay, i) => (
                        <circle key={i} r="5" fill="#334155" opacity="0.9" filter="url(#glow-merchant)">
                          <animateMotion dur="0.85s" begin={`${delay}s`} repeatCount="2" calcMode="spline" keySplines="0.4 0 0.2 1">
                            <mpath href="#mp" />
                          </animateMotion>
                        </circle>
                      ))}

                      {/* Discount stream */}
                      <motion.path
                        d={STREAM_PATH_DISCOUNT}
                        stroke="#7851A9" strokeWidth="2.5" fill="none" strokeLinecap="round"
                        filter="url(#glow-discount)"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.85, ease: [0.4, 0, 0.2, 1], delay: 0.08 }}
                      />
                      {[0.08, 0.43, 0.78].map((delay, i) => (
                        <circle key={i} r="5" fill="#7851A9" opacity="0.9" filter="url(#glow-discount)">
                          <animateMotion dur="0.85s" begin={`${delay}s`} repeatCount="2" calcMode="spline" keySplines="0.4 0 0.2 1">
                            <mpath href="#dp" />
                          </animateMotion>
                        </circle>
                      ))}

                      {/* Nonprofit stream */}
                      <motion.path
                        d={STREAM_PATH_NONPROFIT}
                        stroke="#C2A76F" strokeWidth="3" fill="none" strokeLinecap="round"
                        filter="url(#glow-nonprofit)"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.85, ease: [0.4, 0, 0.2, 1], delay: 0.16 }}
                      />
                      {[0.16, 0.51, 0.86].map((delay, i) => (
                        <circle key={i} r="6" fill="#C2A76F" opacity="0.95" filter="url(#glow-nonprofit)">
                          <animateMotion dur="0.85s" begin={`${delay}s`} repeatCount="2" calcMode="spline" keySplines="0.4 0 0.2 1">
                            <mpath href="#np" />
                          </animateMotion>
                        </circle>
                      ))}

                      {/* Terminal glow nodes at stream endpoints */}
                      {(phase === 'CARDS' || phase === 'IMPACT' || phase === 'COMPLETE') && (
                        <>
                          <motion.circle cx="100" cy="178" r="7" fill="#334155" filter="url(#glow-merchant)"
                            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 0.6 }}
                            transition={{ delay: 0.1, type: 'spring', stiffness: 400, damping: 18 }} />
                          <motion.circle cx="300" cy="178" r="7" fill="#7851A9" filter="url(#glow-discount)"
                            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 0.6 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 18 }} />
                          <motion.circle cx="500" cy="178" r="8" fill="#C2A76F" filter="url(#glow-nonprofit)"
                            initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1.4, 1], opacity: [0, 1, 0.8] }}
                            transition={{ delay: 0.3, duration: 0.5 }} />
                        </>
                      )}
                    </>
                  )}
                </svg>
              </div>

              {/* Destination Cards */}
              <div className="grid grid-cols-3 gap-3 -mt-6">
                {/* Merchant */}
                <AnimatePresence>
                  {(phase === 'CARDS' || phase === 'IMPACT' || phase === 'COMPLETE') && (
                    <motion.div
                      className="bg-slate-900 text-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow-xl"
                      initial={{ opacity: 0, y: 20, scale: 0.88 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0 }}
                    >
                      <span className="text-lg">🏪</span>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Merchant</p>
                      <p className="text-xl font-black italic tracking-tighter text-white">{fmt(merchantCount)}</p>
                      <p className="text-[8px] font-medium text-slate-500 text-center leading-tight">
                        Supports local business
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Discount */}
                <AnimatePresence>
                  {(phase === 'CARDS' || phase === 'IMPACT' || phase === 'COMPLETE') && (
                    <motion.div
                      className="bg-[#7851A9] text-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow-xl"
                      initial={{ opacity: 0, y: 20, scale: 0.88 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.15 }}
                    >
                      <span className="text-lg font-black italic text-white/80">✦</span>
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/60 text-center">Your Discount</p>
                      <p className="text-xl font-black italic tracking-tighter text-white">{fmt(discountCount)}</p>
                      <p className="text-[8px] font-medium text-white/50 text-center leading-tight">
                        Back to your wallet
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Nonprofit — Hero Card */}
                <AnimatePresence>
                  {(phase === 'CARDS' || phase === 'IMPACT' || phase === 'COMPLETE') && (
                    <motion.div
                      className="relative rounded-2xl p-4 flex flex-col items-center gap-2 shadow-2xl overflow-hidden border-2 border-[#C2A76F]"
                      style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)' }}
                      initial={{ opacity: 0, y: 20, scale: 0.88 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.3 }}
                    >
                      {/* Glow pulse behind card */}
                      {(phase === 'IMPACT' || phase === 'COMPLETE') && (
                        <motion.div
                          className="absolute inset-0 rounded-2xl"
                          style={{ background: 'radial-gradient(ellipse at center, rgba(194,167,111,0.25) 0%, transparent 70%)' }}
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      )}
                      <span className="relative z-10 text-lg">♥</span>
                      <p className="relative z-10 text-[9px] font-black uppercase tracking-widest text-amber-600 text-center leading-tight">
                        Donated To
                      </p>
                      <p className="relative z-10 text-xl font-black italic tracking-tighter text-amber-900">
                        {fmt(nonprofitCount)}
                      </p>
                      <p className="relative z-10 text-[8px] font-black text-amber-800 text-center leading-tight">
                        {nonprofitName}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Nonprofit Mission Reveal */}
              <AnimatePresence>
                {(phase === 'IMPACT' || phase === 'COMPLETE') && (
                  <motion.div
                    className="relative mt-5 rounded-[1.5rem] border border-[#C2A76F]/40 overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fef9ee 100%)' }}
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 20 }}
                    transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
                  >
                    {/* Animated left accent bar */}
                    <motion.div
                      className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#C2A76F] to-[#f59e0b]"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
                      style={{ transformOrigin: 'top' }}
                    />
                    <div className="px-5 py-4 pl-6">
                      <motion.div
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25, duration: 0.4 }}
                      >
                        <div className="shrink-0 mt-0.5">
                          <motion.div
                            className="w-8 h-8 rounded-xl bg-[#C2A76F] flex items-center justify-center shadow-md"
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.3, type: 'spring', stiffness: 360, damping: 20 }}
                          >
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                          </motion.div>
                        </div>
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#C2A76F] mb-1">Your Elected Cause</p>
                          <p className="text-sm font-black italic uppercase tracking-tight text-amber-900">{nonprofitName}</p>
                          <p className="text-xs text-amber-700/80 font-medium mt-1 leading-relaxed">{nonprofitMission}</p>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Confetti burst */}
              <AnimatePresence>
                {showConfetti && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2.5rem]" style={{ zIndex: 50 }}>
                    {CONFETTI_PIECES.map(p => (
                      <motion.div
                        key={p.id}
                        className="absolute"
                        style={{
                          left: '62%',
                          top: '72%',
                          width: p.shape === 'circle' ? 8 : 7,
                          height: p.shape === 'circle' ? 8 : 7,
                          borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'diamond' ? '2px' : '1px',
                          backgroundColor: p.color,
                          transformOrigin: 'center',
                          rotate: p.shape === 'diamond' ? '45deg' : '0deg',
                        }}
                        initial={{ x: 0, y: 0, opacity: 1, scale: p.scale, rotate: 0 }}
                        animate={{ x: p.x, y: p.y, opacity: 0, scale: 0, rotate: p.rotation }}
                        transition={{ duration: 1.1, delay: p.delay, ease: [0.2, 0.8, 0.4, 1] }}
                      />
                    ))}
                  </div>
                )}
              </AnimatePresence>

              {/* Achievement Badge */}
              <AnimatePresence>
                {phase === 'COMPLETE' && (
                  <motion.div
                    className="mt-6 flex items-center justify-center gap-3"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                  >
                    <motion.div
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-50 border border-emerald-200"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <motion.div
                        className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.15, type: 'spring', stiffness: 420, damping: 18 }}
                      >
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <motion.path
                            strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ delay: 0.25, duration: 0.4, ease: 'easeOut' }}
                          />
                        </svg>
                      </motion.div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                        Impact Recorded
                      </span>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Continue Button */}
              <AnimatePresence>
                {phase === 'COMPLETE' && (
                  <motion.button
                    onClick={onClose}
                    className="mt-5 w-full bg-black text-white py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[#7851A9] transition-colors duration-300 shadow-xl"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    ✦ Continue Shopping
                  </motion.button>
                )}
              </AnimatePresence>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
