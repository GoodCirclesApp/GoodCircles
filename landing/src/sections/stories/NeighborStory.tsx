import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingBag, Heart, Leaf } from 'lucide-react';
import { BRAND, fadeUp } from '../../lib/brand';
import { submitWaitlist, type WaitlistResponse } from '../../lib/api';
import type { ConfirmationData } from '../../App';

interface Props {
  onConfirm: (data: ConfirmationData) => void;
  onBack:    () => void;
}

const COLOR  = BRAND.emerald;
const RING   = 'focus:ring-emerald-400/30';

export default function NeighborStory({ onConfirm, onBack }: Props) {
  const [email,   setEmail]   = useState('');
  const [zip,     setZip]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) { setError('Please enter your email.'); return; }
    setLoading(true);
    setError('');
    try {
      const res: WaitlistResponse = await submitWaitlist({ role: 'NEIGHBOR', email, zipCode: zip || undefined });
      onConfirm({ position: res.position, inviteCode: res.inviteCode, overflow: res.overflow, role: 'NEIGHBOR', email });
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-20 px-6" style={{ background: '#f8fdf9' }}>
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <motion.button
          {...fadeUp(0)}
          onClick={onBack}
          className="flex items-center gap-2 mb-10 text-sm font-bold transition-colors"
          style={{ color: COLOR }}
        >
          <ArrowLeft size={16} strokeWidth={3} /> Back
        </motion.button>

        {/* Screen A — The value */}
        <motion.div {...fadeUp(0.05)} className="mb-14">
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: COLOR }}>
            How it works for you
          </p>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight mb-6" style={{ letterSpacing: '-0.02em' }}>
            Shop local.<br />Save 10%.<br />
            <span style={{ color: COLOR }}>Fund your cause.</span>
          </h2>
          <p className="text-lg text-slate-600 mb-10 leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif" }}>
            Every purchase you make through GoodCircles is 10% cheaper than the sticker price.
            That discount isn't coming from the merchant's pocket — it's restructured so your community wins together.
          </p>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: <ShoppingBag size={22} />, title: 'You save 10%', body: 'On every local purchase. No coupon codes, no loyalty points — just a lower price, automatically.' },
              { icon: <Heart size={22} />,        title: 'Your cause gets funded', body: '10% of the merchant\'s net profit goes to the nonprofit you choose — on every transaction, forever.' },
              { icon: <Leaf size={22} />,         title: 'Zero extra effort', body: 'Pick your nonprofit once at signup. GoodCircles handles everything else. You just shop.' },
            ].map((card, i) => (
              <motion.div
                key={i}
                {...fadeUp(0.1 + i * 0.08)}
                className="p-6 rounded-2xl border"
                style={{ background: '#fff', borderColor: `${COLOR}25` }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${COLOR}15`, color: COLOR }}>
                  {card.icon}
                </div>
                <p className="font-black text-slate-900 mb-2">{card.title}</p>
                <p className="text-sm text-slate-500 leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif" }}>{card.body}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Screen B — The cause */}
        <motion.div {...fadeUp(0.3)} className="mb-14 p-8 rounded-3xl" style={{ background: `${COLOR}08`, border: `1px solid ${COLOR}20` }}>
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: COLOR }}>At launch</p>
          <h3 className="text-2xl font-black text-slate-900 mb-3">Pick your nonprofit once. Fund it forever.</h3>
          <p className="text-slate-600 leading-relaxed mb-0" style={{ fontFamily: "'Fira Sans', sans-serif" }}>
            At launch, you'll elect any eligible 501(c)(3) in the United States as your cause.
            Every time you shop, 10% of the merchant's net profit flows to them automatically —
            without an extra click, extra app, or extra thought.
          </p>
        </motion.div>

        {/* Screen C — The form */}
        <motion.div {...fadeUp(0.4)}>
          <div className="p-8 rounded-3xl" style={{ background: '#fff', boxShadow: `0 4px 40px ${COLOR}12` }}>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Claim your founding spot.</h3>
            <p className="text-slate-500 mb-8" style={{ fontFamily: "'Fira Sans', sans-serif" }}>
              Founding members get first access when GoodCircles launches September 2026. Spots are limited.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className={`w-full px-8 py-5 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 ${RING} text-base font-medium placeholder-slate-400 transition-all`}
              />
              <input
                type="text"
                placeholder="ZIP code (optional — helps us match local merchants)"
                value={zip}
                onChange={e => setZip(e.target.value)}
                className={`w-full px-8 py-5 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 ${RING} text-base font-medium placeholder-slate-400 transition-all`}
              />

              {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-5 rounded-2xl font-black text-sm uppercase tracking-wider text-white transition-all disabled:opacity-60"
                style={{ background: `linear-gradient(135deg, ${COLOR}, #047857)` }}
              >
                {loading ? 'Claiming your spot…' : 'Claim my founding spot →'}
              </motion.button>

              <p className="text-center text-xs text-slate-400">
                Founding member status. One email at launch. Unsubscribe anytime.
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
