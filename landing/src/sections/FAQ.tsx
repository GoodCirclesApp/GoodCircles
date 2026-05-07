import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { BRAND, fadeUp } from '../lib/brand';

const FAQS = [
  {
    q: 'When does GoodCircles launch?',
    a: 'We\'re targeting September 2026. Waitlist members will receive an exclusive early-access email with their personalized invite link the week before the public launch.',
  },
  {
    q: 'Is my email shared with anyone?',
    a: 'GoodCircles will never sell your data or share it outside the platform. Within the circle, relevant information is shared with the nonprofits you elect and the merchants you shop with — that\'s how the community works. But no data leaves GoodCircles. Ever.',
  },
  {
    q: 'Does joining the waitlist cost anything?',
    a: 'Nothing. Joining the waitlist is free. The GoodCircles marketplace itself is free for neighbors to use — there are no subscription fees, membership fees, or hidden costs.',
  },
  {
    q: 'What if my nonprofit isn\'t already on the platform?',
    a: 'Nonprofits need a free GoodCircles account to be elected and receive donations. If your favorite organization isn\'t on the platform yet, you can invite them — membership is completely free for nonprofits. If you run a nonprofit, joining the waitlist now gets you pre-verified and visible to neighbors from day one.',
  },
  {
    q: 'Is GoodCircles available in my city?',
    a: 'GoodCircles is designed to work anywhere in the United States. We\'re starting with a focus on select markets at launch, then expanding rapidly. Providing your ZIP code helps us prioritize your area.',
  },
  {
    q: 'Who built GoodCircles?',
    a: 'GoodCircles was built by a team that believes local commerce is the foundation of thriving communities. We\'re an independent company — not backed by big-box retail or a venture firm with conflicting interests.',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 px-6 bg-white">
      <div className="max-w-2xl mx-auto">
        <motion.p {...fadeUp(0)} className="text-center text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#ccc' }}>
          Questions
        </motion.p>
        <motion.h2 {...fadeUp(0.05)} className="text-4xl font-black text-center text-slate-900 mb-12" style={{ letterSpacing: '-0.02em' }}>
          Good answers.
        </motion.h2>

        <div className="flex flex-col gap-2">
          {FAQS.map((faq, i) => (
            <motion.div key={i} {...fadeUp(0.05 + i * 0.06)}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full text-left p-6 rounded-2xl border flex items-start justify-between gap-4 transition-all"
                style={{
                  background: open === i ? `${BRAND.purple}06` : '#fff',
                  borderColor: open === i ? `${BRAND.purple}30` : '#e5e7eb',
                }}
              >
                <span className="font-black text-slate-900 leading-snug text-base">{faq.q}</span>
                <span className="shrink-0 mt-0.5" style={{ color: BRAND.purple }}>
                  {open === i ? <Minus size={18} strokeWidth={3} /> : <Plus size={18} strokeWidth={3} />}
                </span>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 py-4 text-slate-600 leading-relaxed text-sm border border-t-0 rounded-b-2xl"
                       style={{ borderColor: `${BRAND.purple}20`, fontFamily: "'Fira Sans', sans-serif" }}>
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
