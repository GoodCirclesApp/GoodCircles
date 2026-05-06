import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, BarChart2, CheckCircle } from 'lucide-react';
import { BRAND, fadeUp } from '../../lib/brand';
import { submitWaitlist, type WaitlistResponse } from '../../lib/api';
import type { ConfirmationData } from '../../App';

interface Props {
  onConfirm: (data: ConfirmationData) => void;
  onBack:    () => void;
}

const COLOR = BRAND.crimson;
const RING  = 'focus:ring-red-400/30';

export default function NonprofitStory({ onConfirm, onBack }: Props) {
  const [email,   setEmail]   = useState('');
  const [orgName, setOrgName] = useState('');
  const [ein,     setEin]     = useState('');
  const [city,    setCity]    = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !orgName) { setError('Please provide your email and organization name.'); return; }
    setLoading(true);
    setError('');
    try {
      const res: WaitlistResponse = await submitWaitlist({
        role: 'NONPROFIT', email, orgName,
        ein: ein || undefined,
        city: city || undefined,
      });
      onConfirm({ position: res.position, inviteCode: res.inviteCode, role: 'NONPROFIT', email });
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-20 px-6" style={{ background: '#fdf8f8' }}>
      <div className="max-w-3xl mx-auto">
        <motion.button {...fadeUp(0)} onClick={onBack} className="flex items-center gap-2 mb-10 text-sm font-bold" style={{ color: COLOR }}>
          <ArrowLeft size={16} strokeWidth={3} /> Back
        </motion.button>

        {/* Screen A — The mechanism */}
        <motion.div {...fadeUp(0.05)} className="mb-14">
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: COLOR }}>How it works</p>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight mb-6" style={{ letterSpacing: '-0.02em' }}>
            Funding that finds you.<br />
            <span style={{ color: COLOR }}>Not the other way around.</span>
          </h2>
          <p className="text-lg text-slate-600 mb-10 leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif" }}>
            GoodCircles routes 10% of every merchant's net profit to the nonprofit their customers have elected.
            When neighbors in your community shop local, you receive a direct share — automatically,
            with zero grant applications, zero fundraising events, and zero donor cultivation.
          </p>

          <div className="flex flex-col gap-4">
            {[
              { num: '01', icon: <RefreshCw size={18} />,    title: 'Recurring, not one-time', body: 'Every transaction — not just the first one — generates a donation. Your funding grows as your community shops.' },
              { num: '02', icon: <BarChart2 size={18} />,    title: 'Transparent to the penny', body: 'Real-time dashboards show every dollar donated, which merchants drove it, and your cumulative total.' },
              { num: '03', icon: <CheckCircle size={18} />,  title: 'IRS-verified distributions', body: 'Merchants receive tax documentation for every donation. Your EIN is verified before funds flow.' },
            ].map((step, i) => (
              <motion.div
                key={i}
                {...fadeUp(0.1 + i * 0.08)}
                className="flex gap-5 p-6 rounded-2xl border"
                style={{ background: '#fff', borderColor: `${COLOR}20` }}
              >
                <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${COLOR}12`, color: COLOR }}>
                  {step.icon}
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: '#ccc' }}>{step.num}</p>
                  <p className="font-black text-slate-900 mb-1">{step.title}</p>
                  <p className="text-sm text-slate-500 leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif" }}>{step.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Screen B — The math */}
        <motion.div {...fadeUp(0.35)} className="mb-14 p-8 rounded-3xl" style={{ background: `${COLOR}08`, border: `1px solid ${COLOR}25` }}>
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: COLOR }}>The compounding effect</p>
          <h3 className="text-2xl font-black text-slate-900 mb-4">Passive income that grows with your community.</h3>
          <p className="text-slate-600 leading-relaxed mb-6" style={{ fontFamily: "'Fira Sans', sans-serif" }}>
            If 200 neighbors elect your nonprofit and each spends $200/month on GoodCircles merchants with an
            average 30% net margin, your organization receives approximately:
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Per Month', value: '~$1,200' },
              { label: 'Per Year',  value: '~$14,400' },
              { label: 'Per 500 neighbors', value: '~$36K/yr' },
            ].map((stat, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white">
                <p className="text-2xl font-black mb-1" style={{ color: COLOR }}>{stat.value}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-4" style={{ fontFamily: "'Fira Sans', sans-serif" }}>
            Estimates based on 10% of net profit model. Actual amounts vary by transaction volume and merchant mix.
          </p>
        </motion.div>

        {/* Screen C — Form */}
        <motion.div {...fadeUp(0.5)}>
          <div className="p-8 rounded-3xl" style={{ background: '#fff', boxShadow: `0 4px 40px ${COLOR}15` }}>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Reserve your nonprofit's spot.</h3>
            <p className="text-slate-500 mb-8" style={{ fontFamily: "'Fira Sans', sans-serif" }}>
              Your organization will be pre-verified and visible to neighbors from day one.
              Providing your EIN now skips the verification queue at launch.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input type="email" placeholder="Your email address" value={email} onChange={e => setEmail(e.target.value)} required
                className={`w-full px-8 py-5 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 ${RING} text-base font-medium placeholder-slate-400 transition-all`} />
              <input type="text" placeholder="Organization name" value={orgName} onChange={e => setOrgName(e.target.value)} required
                className={`w-full px-8 py-5 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 ${RING} text-base font-medium placeholder-slate-400 transition-all`} />
              <div className="grid sm:grid-cols-2 gap-4">
                <input type="text" placeholder="EIN (optional — skip the queue)" value={ein} onChange={e => setEin(e.target.value)}
                  className={`w-full px-8 py-5 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 ${RING} text-base font-medium placeholder-slate-400 transition-all`} />
                <input type="text" placeholder="City" value={city} onChange={e => setCity(e.target.value)}
                  className={`w-full px-8 py-5 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 ${RING} text-base font-medium placeholder-slate-400 transition-all`} />
              </div>

              {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

              <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                className="w-full py-5 rounded-2xl font-black text-sm uppercase tracking-wider text-white transition-all disabled:opacity-60"
                style={{ background: `linear-gradient(135deg, ${COLOR}, #7a0019)` }}>
                {loading ? 'Reserving your spot…' : "Reserve my nonprofit's spot →"}
              </motion.button>

              <p className="text-center text-xs text-slate-400">One email at launch. Unsubscribe with one click.</p>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
