import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Building2 } from 'lucide-react';
import { BRAND, fadeUp } from '../../lib/brand';
import { submitWaitlist, type WaitlistResponse } from '../../lib/api';
import type { ConfirmationData } from '../../App';

interface Props {
  onConfirm: (data: ConfirmationData) => void;
  onBack:    () => void;
}

const COLOR = BRAND.navy;
const RING  = 'focus:ring-blue-900/30';

export default function MunicipalStory({ onConfirm, onBack }: Props) {
  const [email,             setEmail]             = useState('');
  const [jurisdiction,      setJurisdiction]      = useState('');
  const [decisionMakerRole, setDecisionMakerRole] = useState('');
  const [interestArea,      setInterestArea]      = useState('');
  const [loading,           setLoading]           = useState(false);
  const [error,             setError]             = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) { setError('Please enter your email address.'); return; }
    setLoading(true);
    setError('');
    try {
      const res: WaitlistResponse = await submitWaitlist({
        role:              'MUNICIPAL',
        email,
        jurisdiction:      jurisdiction      || undefined,
        decisionMakerRole: decisionMakerRole || undefined,
        interestArea:      interestArea      || undefined,
        requestBriefing:   true,
      });
      onConfirm({ position: res.position, inviteCode: res.inviteCode, overflow: res.overflow, role: 'MUNICIPAL', email });
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-20 px-6" style={{ background: '#f0f4fa' }}>
      <div className="max-w-3xl mx-auto">
        <motion.button {...fadeUp(0)} onClick={onBack} className="flex items-center gap-2 mb-10 text-sm font-bold" style={{ color: COLOR }}>
          <ArrowLeft size={16} strokeWidth={3} /> Back
        </motion.button>

        <motion.div {...fadeUp(0.05)} className="mb-14">
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: COLOR }}>For cities & counties</p>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight mb-6" style={{ letterSpacing: '-0.02em' }}>
            Strengthen the economy<br />
            <span style={{ color: COLOR }}>your community already has.</span>
          </h2>
          <p className="text-lg text-slate-600 mb-10 leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif" }}>
            GoodCircles keeps dollars circulating locally, surfaces the small businesses that are
            driving community growth, and gives municipal partners real-time visibility into the
            economic health of their district — without launching a new program or hiring a consultant.
          </p>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: <BarChart />,         title: 'Local spend retention',    body: 'Track the share of resident spending that stays within your community, updated daily.' },
              { icon: <MapPin size={20} />, title: 'Neighborhood-level data',  body: 'See which areas and business categories are growing so you can direct support where it matters.' },
              { icon: <Building2 size={20} />, title: 'No new infrastructure', body: 'GoodCircles runs independently. Municipal partners connect their dashboard — nothing to build or maintain.' },
            ].map((card, i) => (
              <motion.div key={i} {...fadeUp(0.1 + i * 0.07)} className="p-6 rounded-2xl border" style={{ background: '#fff', borderColor: `${COLOR}25` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${COLOR}12`, color: COLOR }}>
                  {card.icon}
                </div>
                <p className="font-black text-slate-900 mb-1">{card.title}</p>
                <p className="text-sm text-slate-500 leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif" }}>{card.body}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div {...fadeUp(0.4)}>
          <div className="p-8 rounded-3xl" style={{ background: '#fff', boxShadow: `0 4px 40px ${COLOR}18` }}>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Request a partnership briefing.</h3>
            <p className="text-slate-500 mb-8" style={{ fontFamily: "'Fira Sans', sans-serif" }}>
              Our team will reach out before launch to walk through the partnership model.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input type="email" placeholder="Your government email" value={email} onChange={e => setEmail(e.target.value)} required
                className={`w-full px-8 py-5 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 ${RING} text-base font-medium placeholder-slate-400 transition-all`} />
              <input type="text" placeholder="City or county name" value={jurisdiction} onChange={e => setJurisdiction(e.target.value)}
                className={`w-full px-8 py-5 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 ${RING} text-base font-medium placeholder-slate-400 transition-all`} />
              <input type="text" placeholder="Your role (e.g. Economic Development Director)" value={decisionMakerRole} onChange={e => setDecisionMakerRole(e.target.value)}
                className={`w-full px-8 py-5 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 ${RING} text-base font-medium placeholder-slate-400 transition-all`} />
              <select value={interestArea} onChange={e => setInterestArea(e.target.value)}
                className={`w-full px-8 py-5 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 ${RING} text-base font-medium text-slate-500 transition-all`}>
                <option value="">Primary interest area (optional)</option>
                <option value="small_biz_support">Small business support</option>
                <option value="eda">Economic Development (EDA)</option>
                <option value="cdbg">CDBG reporting</option>
                <option value="general">General economic development</option>
              </select>
              {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
              <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                className="w-full py-5 rounded-2xl font-black text-sm uppercase tracking-wider text-white disabled:opacity-60"
                style={{ background: `linear-gradient(135deg, ${COLOR}, #0f2040)` }}>
                {loading ? 'Submitting…' : 'Request a partnership briefing →'}
              </motion.button>
              <p className="text-center text-xs text-slate-400">We'll contact you directly. No spam.</p>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function BarChart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6"  y1="20" x2="6"  y2="14" />
      <line x1="2"  y1="20" x2="22" y2="20" />
    </svg>
  );
}
