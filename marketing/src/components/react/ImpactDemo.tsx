import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BRAND, fadeUp } from '../../lib/brand';

// Illustrative amounts: $100 MSRP, $60 COGS, consumer saves 10%
// Merchant receives $86.70 ($60 COGS recovery + $26.70 = 89% of $30 gross profit)
// Nonprofit receives $3.00 (10% of $30 gross profit), platform $0.30 (1%)
const DEMO = { gross: 100, discount: 10, merchant: 86.70, nonprofit: 3.00 };

type Phase = 'IDLE' | 'HUB' | 'STREAMS' | 'CARDS' | 'IMPACT' | 'COMPLETE';

const STREAM_PATH_MERCHANT  = 'M 300 0 C 300 88 100 88 100 178';
const STREAM_PATH_DISCOUNT  = 'M 300 0 C 300 88 300 88 300 178';
const STREAM_PATH_NONPROFIT = 'M 300 0 C 300 88 500 88 500 178';

function useCountUp(target: number, durationMs: number, active: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active || target === 0) { setValue(0); return; }
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1);
      setValue(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setValue(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs, active]);
  return value;
}

export default function ImpactDemo() {
  const [phase, setPhase] = useState<Phase>('IDLE');
  const [runKey, setRunKey] = useState(0);

  const countActive = phase === 'IMPACT' || phase === 'COMPLETE';
  const merchantVal  = useCountUp(DEMO.merchant,  900, countActive);
  const discountVal  = useCountUp(DEMO.discount,  900, countActive);
  const nonprofitVal = useCountUp(DEMO.nonprofit, 900, countActive);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const add = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms));

    setPhase('IDLE');
    add(() => setPhase('HUB'),      200);
    add(() => setPhase('STREAMS'),  750);
    add(() => setPhase('CARDS'),    1600);
    add(() => setPhase('IMPACT'),   2200);
    add(() => setPhase('COMPLETE'), 3100);
    add(() => setRunKey(k => k + 1), 30000); // replay every 30s

    return () => timers.forEach(clearTimeout);
  }, [runKey]);

  const fmt = (n: number) => `$${n.toFixed(2)}`;
  const show = (p: Phase) => ['CARDS', 'IMPACT', 'COMPLETE'].includes(phase) && phase >= p || ['CARDS', 'IMPACT', 'COMPLETE'].includes(phase);

  const cardVisible = phase === 'CARDS' || phase === 'IMPACT' || phase === 'COMPLETE';

  return (
    <section className="py-24 px-6" style={{ background: '#F9F7FE' }}>
      <div className="max-w-2xl mx-auto">

        {/* Section header */}
        <motion.div {...fadeUp(0)} className="text-center mb-12">
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: BRAND.purple }}>
            How the money moves
          </p>
          <h2
            className="font-black text-slate-900 mb-4"
            style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', letterSpacing: '-0.02em', lineHeight: 1.05 }}
          >
            One purchase.<br />
            <span style={{ color: BRAND.gold }}>Three wins.</span> Every time.
          </h2>
          <p className="text-slate-500 text-base leading-relaxed max-w-lg mx-auto" style={{ fontFamily: "'Fira Sans', sans-serif" }}>
            Watch what happens when someone shops local through Good Circles.
            No extra steps. No opt-ins. Just this — automatically, on every transaction.
          </p>
        </motion.div>

        {/* Animation card */}
        <motion.div {...fadeUp(0.1)} className="bg-white rounded-[2rem] shadow-xl overflow-hidden">

          {/* Top gradient bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#7851A9] via-[#C2A76F] to-[#22c55e]" />

          <div className="px-6 pt-8 pb-8">

            {/* Header */}
            <AnimatePresence>
              {phase !== 'IDLE' && (
                <motion.div className="text-center mb-6"
                  initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}>
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#C2A76F]">✦ See It In Action ✦</p>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-black mt-1">Every Dollar Counts.</h3>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hub */}
            <div className="flex justify-center">
              <AnimatePresence>
                {phase !== 'IDLE' && (
                  <motion.div className="relative flex flex-col items-center"
                    initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 340, damping: 22 }}>
                    {(phase === 'HUB' || phase === 'STREAMS') && (
                      <>
                        <motion.div className="absolute inset-0 rounded-full border-2 border-[#C2A76F]/40"
                          animate={{ scale: [1, 1.7], opacity: [0.6, 0] }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }} />
                        <motion.div className="absolute inset-0 rounded-full border border-[#C2A76F]/25"
                          animate={{ scale: [1, 2.1], opacity: [0.4, 0] }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut', delay: 0.3 }} />
                      </>
                    )}
                    <div className="relative z-10 bg-black text-white rounded-full w-28 h-28 flex flex-col items-center justify-center shadow-2xl">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#C2A76F] mb-0.5">Purchase</span>
                      <span className="text-2xl font-black italic tracking-tighter">{fmt(DEMO.gross)}</span>
                    </div>
                    <motion.p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mt-3"
                      animate={phase === 'STREAMS' ? { opacity: [0.4, 1, 0.4] } : { opacity: 0.6 }}
                      transition={{ duration: 1.4, repeat: phase === 'STREAMS' ? Infinity : 0 }}>
                      {phase === 'STREAMS' ? 'Splitting...' : 'Split'}
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* SVG Streams */}
            <div className="relative -mt-4" style={{ height: 190 }}>
              <svg viewBox="0 0 600 190" className="w-full h-full" style={{ overflow: 'visible' }}>
                <defs>
                  <filter id="lp-gm" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                  <filter id="lp-gd" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                  <filter id="lp-gn" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                  <path id="lp-mp" d={STREAM_PATH_MERCHANT} />
                  <path id="lp-dp" d={STREAM_PATH_DISCOUNT} />
                  <path id="lp-np" d={STREAM_PATH_NONPROFIT} />
                </defs>

                {(phase === 'STREAMS' || cardVisible) && (
                  <>
                    <motion.path d={STREAM_PATH_MERCHANT} stroke="#334155" strokeWidth="2.5" fill="none" strokeLinecap="round" filter="url(#lp-gm)"
                      initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.85, ease: [0.4,0,0.2,1] }} />
                    {[0, 0.35, 0.7].map((delay, i) => (
                      <circle key={i} r="5" fill="#334155" opacity="0.9" filter="url(#lp-gm)">
                        <animateMotion dur="0.85s" begin={`${delay}s`} repeatCount="2" calcMode="spline" keySplines="0.4 0 0.2 1"><mpath href="#lp-mp" /></animateMotion>
                      </circle>
                    ))}

                    <motion.path d={STREAM_PATH_DISCOUNT} stroke="#7851A9" strokeWidth="2.5" fill="none" strokeLinecap="round" filter="url(#lp-gd)"
                      initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.85, ease: [0.4,0,0.2,1], delay: 0.08 }} />
                    {[0.08, 0.43, 0.78].map((delay, i) => (
                      <circle key={i} r="5" fill="#7851A9" opacity="0.9" filter="url(#lp-gd)">
                        <animateMotion dur="0.85s" begin={`${delay}s`} repeatCount="2" calcMode="spline" keySplines="0.4 0 0.2 1"><mpath href="#lp-dp" /></animateMotion>
                      </circle>
                    ))}

                    <motion.path d={STREAM_PATH_NONPROFIT} stroke="#C2A76F" strokeWidth="3" fill="none" strokeLinecap="round" filter="url(#lp-gn)"
                      initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.85, ease: [0.4,0,0.2,1], delay: 0.16 }} />
                    {[0.16, 0.51, 0.86].map((delay, i) => (
                      <circle key={i} r="6" fill="#C2A76F" opacity="0.95" filter="url(#lp-gn)">
                        <animateMotion dur="0.85s" begin={`${delay}s`} repeatCount="2" calcMode="spline" keySplines="0.4 0 0.2 1"><mpath href="#lp-np" /></animateMotion>
                      </circle>
                    ))}

                    {cardVisible && (
                      <>
                        <motion.circle cx="100" cy="178" r="7" fill="#334155" filter="url(#lp-gm)"
                          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 0.6 }}
                          transition={{ delay: 0.1, type: 'spring', stiffness: 400, damping: 18 }} />
                        <motion.circle cx="300" cy="178" r="7" fill="#7851A9" filter="url(#lp-gd)"
                          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 0.6 }}
                          transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 18 }} />
                        <motion.circle cx="500" cy="178" r="8" fill="#C2A76F" filter="url(#lp-gn)"
                          initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0,1.4,1], opacity: [0,1,0.8] }}
                          transition={{ delay: 0.3, duration: 0.5 }} />
                      </>
                    )}
                  </>
                )}
              </svg>
            </div>

            {/* Destination cards */}
            <div className="grid grid-cols-3 gap-3 -mt-6">
              <AnimatePresence>
                {cardVisible && (
                  <motion.div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow-xl"
                    initial={{ opacity: 0, y: 20, scale: 0.88 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0 }}>
                    <span className="text-lg">🏪</span>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Merchant keeps</p>
                    <p className="text-xl font-black italic tracking-tighter">{fmt(merchantVal)}</p>
                    <p className="text-[8px] font-medium text-slate-500 text-center leading-tight">COGS + 89% of profit</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {cardVisible && (
                  <motion.div className="rounded-2xl p-4 flex flex-col items-center gap-2 shadow-xl"
                    style={{ background: BRAND.purple }}
                    initial={{ opacity: 0, y: 20, scale: 0.88 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.15 }}>
                    <span className="text-lg font-black italic text-white/80">✦</span>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/60 text-center">You save</p>
                    <p className="text-xl font-black italic tracking-tighter text-white">{fmt(discountVal)}</p>
                    <p className="text-[8px] font-medium text-white/50 text-center leading-tight">10% off, every time</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {cardVisible && (
                  <motion.div className="relative rounded-2xl p-4 flex flex-col items-center gap-2 shadow-2xl overflow-hidden border-2 border-[#C2A76F]"
                    style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)' }}
                    initial={{ opacity: 0, y: 20, scale: 0.88 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.3 }}>
                    {countActive && (
                      <motion.div className="absolute inset-0 rounded-2xl"
                        style={{ background: 'radial-gradient(ellipse at center, rgba(194,167,111,0.25) 0%, transparent 70%)' }}
                        animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
                    )}
                    <span className="relative z-10 text-lg">♥</span>
                    <p className="relative z-10 text-[9px] font-black uppercase tracking-widest text-amber-600 text-center">Donated to</p>
                    <p className="relative z-10 text-xl font-black italic tracking-tighter text-amber-900">{fmt(nonprofitVal)}</p>
                    <p className="relative z-10 text-[8px] font-black text-amber-800 text-center leading-tight">Your chosen cause</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Complete badge */}
            <AnimatePresence>
              {phase === 'COMPLETE' && (
                <motion.div className="mt-6 flex justify-center"
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                  <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-50 border border-emerald-200">
                    <motion.div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"
                      initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 420, damping: 18 }}>
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <motion.path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"
                          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.15, duration: 0.4 }} />
                      </svg>
                    </motion.div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                      Three wins. One purchase. Automatic.
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </motion.div>

        {/* Day-in-the-life caption */}
        <motion.p
          {...fadeUp(0.2)}
          className="text-center text-sm text-slate-400 mt-5 leading-relaxed max-w-lg mx-auto"
          style={{ fontFamily: "'Fira Sans', sans-serif" }}
        >
          Real example: a $100 item from a local boutique. You pay $90 — $10 stays in your pocket.
          The boutique receives $86.70 (their cost of goods plus profit share). $3 goes to the
          food pantry you chose at signup. No coupon codes, no extra apps, no thinking about it — just this, every time.
        </motion.p>

      </div>
    </section>
  );
}
