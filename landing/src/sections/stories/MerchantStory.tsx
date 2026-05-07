import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Users, Award } from 'lucide-react';
import { BRAND, fadeUp } from '../../lib/brand';
import { submitWaitlist, type WaitlistResponse } from '../../lib/api';
import type { ConfirmationData } from '../../App';

interface Props {
  onConfirm: (data: ConfirmationData) => void;
  onBack:    () => void;
}

const COLOR = BRAND.gold;
const RING  = 'focus:ring-amber-400/30';

const COMPARISON = [
  { platform: 'Amazon',       youKeep: '~70%',  note: 'Referral fee + fulfillment' },
  { platform: 'Etsy',         youKeep: '~80%',  note: 'Transaction + listing fees' },
  { platform: 'Stripe alone', youKeep: '~97%',  note: 'No discovery, no community' },
  { platform: 'GoodCircles',  youKeep: '89%',   note: 'Of net profit + tax benefit', highlight: true },
];

export default function MerchantStory({ onConfirm, onBack }: Props) {
  const [email,        setEmail]        = useState('');
  const [businessName, setBusinessName] = useState('');
  const [city,         setCity]         = useState('');
  const [category,     setCategory]     = useState('');
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !businessName) { setError('Please fill in your email and business name.'); return; }
    setLoading(true);
    setError('');
    try {
      const res: WaitlistResponse = await submitWaitlist({
        role: 'MERCHANT', email, businessName,
        city: city || undefined,
        category: category || undefined,
      });
      onConfirm({ position: res.position, inviteCode: res.inviteCode, overflow: res.overflow, role: 'MERCHANT', email });
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-20 px-6" style={{ background: '#fdfbf5' }}>
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <motion.button {...fadeUp(0)} onClick={onBack} className="flex items-center gap-2 mb-10 text-sm font-bold transition-colors" style={{ color: COLOR }}>
          <ArrowLeft size={16} strokeWidth={3} /> Back
        </motion.button>

        {/* Screen A — The number */}
        <motion.div {...fadeUp(0.05)} className="mb-14">
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: COLOR }}>The math</p>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight mb-6" style={{ letterSpacing: '-0.02em' }}>
            You keep <span style={{ color: COLOR }}>89¢</span><br />
            of every dollar<br />you earn.
          </h2>
          <p className="text-lg text-slate-600 mb-10 leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif" }}>
            The other 11¢? 10¢ goes to your community's chosen nonprofits — creating a tax-deductible
            charitable contribution on your behalf. 1¢ is GoodCircles' platform fee.
            No race to the bottom on pricing, no algorithm taxing your visibility.
          </p>

          {/* Comparison table */}
          <div className="rounded-2xl overflow-hidden border border-slate-200">
            <table className="w-full">
              <thead>
                <tr style={{ background: '#f8f8f8' }}>
                  <th className="text-left px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-500">Platform</th>
                  <th className="text-center px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-500">You Keep</th>
                  <th className="text-right px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-500 hidden sm:table-cell">Notes</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr
                    key={i}
                    style={{
                      background: row.highlight ? `${COLOR}12` : i % 2 === 0 ? '#fff' : '#fafafa',
                      borderTop: '1px solid #f0f0f0',
                    }}
                  >
                    <td className="px-5 py-4">
                      <span className={`font-bold text-sm ${row.highlight ? '' : 'text-slate-700'}`} style={row.highlight ? { color: COLOR } : {}}>
                        {row.highlight && '★ '}{row.platform}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`font-black text-lg ${row.highlight ? '' : 'text-slate-800'}`} style={row.highlight ? { color: COLOR } : {}}>
                        {row.youKeep}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right text-xs text-slate-400 hidden sm:table-cell" style={{ fontFamily: "'Fira Sans', sans-serif" }}>
                      {row.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Screen B — The customer */}
        <motion.div {...fadeUp(0.3)} className="mb-14 grid sm:grid-cols-3 gap-4">
          {[
            { icon: <Users size={22} />,      title: 'Community-loyal buyers',    body: 'Neighbors save 10% by shopping GoodCircles — so they\'re actively looking for businesses like yours.' },
            { icon: <TrendingUp size={22} />, title: 'Your discovery is built-in', body: 'When neighbors elect their nonprofit and shop in your category, you show up. No paid ads required.' },
            { icon: <Award size={22} />,      title: 'Founding Merchant status',   body: 'Early merchants earn a permanent Founding Merchant badge visible to every customer who visits your profile.' },
          ].map((card, i) => (
            <motion.div
              key={i}
              {...fadeUp(0.35 + i * 0.08)}
              className="p-6 rounded-2xl border"
              style={{ background: '#fff', borderColor: `${COLOR}30` }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${COLOR}15`, color: COLOR }}>
                {card.icon}
              </div>
              <p className="font-black text-slate-900 mb-2">{card.title}</p>
              <p className="text-sm text-slate-500 leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif" }}>{card.body}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Screen C — The form */}
        <motion.div {...fadeUp(0.5)}>
          <div className="p-8 rounded-3xl" style={{ background: '#fff', boxShadow: `0 4px 40px ${COLOR}20` }}>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Claim your Founding Merchant spot.</h3>
            <p className="text-slate-500 mb-8" style={{ fontFamily: "'Fira Sans', sans-serif" }}>
              Founding Merchant status is permanent — early merchants earn it once.
              Priority catalog access and placement at launch. Spots are limited.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input type="email" placeholder="Your email address" value={email} onChange={e => setEmail(e.target.value)} required
                className={`w-full px-8 py-5 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 ${RING} text-base font-medium placeholder-slate-400 transition-all`} />
              <input type="text" placeholder="Business name" value={businessName} onChange={e => setBusinessName(e.target.value)} required
                className={`w-full px-8 py-5 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 ${RING} text-base font-medium placeholder-slate-400 transition-all`} />
              <div className="grid sm:grid-cols-2 gap-4">
                <input type="text" placeholder="City" value={city} onChange={e => setCity(e.target.value)}
                  className={`w-full px-8 py-5 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 ${RING} text-base font-medium placeholder-slate-400 transition-all`} />
                <input type="text" placeholder="Business type (e.g. Food, Retail)" value={category} onChange={e => setCategory(e.target.value)}
                  className={`w-full px-8 py-5 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 ${RING} text-base font-medium placeholder-slate-400 transition-all`} />
              </div>

              {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

              <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                className="w-full py-5 rounded-2xl font-black text-sm uppercase tracking-wider text-white transition-all disabled:opacity-60"
                style={{ background: `linear-gradient(135deg, ${COLOR}, #9a7d3a)` }}>
                {loading ? 'Claiming your spot…' : 'Claim my Founding Merchant spot →'}
              </motion.button>

              <p className="text-center text-xs text-slate-400">
                Founding Merchant status. One email at launch. Unsubscribe anytime.
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
