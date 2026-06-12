import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Database, MapPin, FileText, Building2 } from 'lucide-react';
import { BRAND, fadeUp } from '../../../lib/brand';
import { submitWaitlist, type WaitlistResponse } from '../../../lib/api';
import type { ConfirmationData } from '../types';

interface Props {
  onConfirm: (data: ConfirmationData) => void;
  onBack:    () => void;
}

const COLOR = BRAND.darkGold;
const RING  = 'focus:ring-yellow-600/30';

export default function CdfiStory({ onConfirm, onBack }: Props) {
  const [email,          setEmail]          = useState('');
  const [orgName,        setOrgName]        = useState('');
  const [cdfiCertNumber, setCdfiCertNumber] = useState('');
  const [lendingRegion,  setLendingRegion]  = useState('');
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) { setError('Please enter your email address.'); return; }
    setLoading(true);
    setError('');
    try {
      const res: WaitlistResponse = await submitWaitlist({
        role:           'CDFI',
        email,
        orgName:        orgName        || undefined,
        cdfiCertNumber: cdfiCertNumber || undefined,
        lendingRegions: lendingRegion  ? [lendingRegion] : undefined,
        requestBriefing: true,
      });
      onConfirm({ position: res.position, inviteCode: res.inviteCode, overflow: res.overflow, alreadyRegistered: res.alreadyRegistered, role: 'CDFI', email });
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-20 px-6" style={{ background: '#fdfbf0' }}>
      <div className="max-w-3xl mx-auto">
        <motion.button {...fadeUp(0)} onClick={onBack} className="flex items-center gap-2 mb-10 text-sm font-bold" style={{ color: COLOR }}>
          <ArrowLeft size={16} strokeWidth={3} /> Back
        </motion.button>

        <motion.div {...fadeUp(0.05)} className="mb-14">
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: COLOR }}>For CDFIs & community lenders</p>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight mb-6" style={{ letterSpacing: '-0.02em' }}>
            Back the businesses<br />
            <span style={{ color: COLOR }}>already building something.</span>
          </h2>
          <p className="text-lg text-slate-600 mb-10 leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif" }}>
            Good Circles gives Treasury-certified CDFIs a live window into merchant performance —
            transaction volume, revenue trends, and community engagement — for businesses operating
            in Qualified Investment Areas. Find the ones ready for capital before they come looking for it.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: <Database size={20} />,  title: 'Live performance visibility',  body: 'Revenue, margin, and transaction data updated in real time — not quarterly PDFs sent on request.' },
              { icon: <MapPin size={20} />,    title: 'QIA targeting built in',        body: 'Merchants in Low-to-Moderate Income census tracts are automatically identified in your pipeline.' },
              { icon: <FileText size={20} />,  title: 'TLR-ready packages',            body: 'Structured merchant snapshots mapped to your Transaction Level Report format — ready to submit.' },
              { icon: <Building2 size={20} />, title: 'Pre-engaged relationships',     body: 'Merchants on Good Circles are already community-invested. No cold outreach required.' },
            ].map((card, i) => (
              <motion.div key={i} {...fadeUp(0.1 + i * 0.07)} className="p-6 rounded-2xl border" style={{ background: '#fff', borderColor: `${COLOR}30` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${COLOR}15`, color: COLOR }}>
                  {card.icon}
                </div>
                <p className="font-black text-slate-900 mb-1">{card.title}</p>
                <p className="text-sm text-slate-500 leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif" }}>{card.body}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div {...fadeUp(0.4)}>
          <div className="p-8 rounded-3xl" style={{ background: '#fff', boxShadow: `0 4px 40px ${COLOR}20` }}>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Request a founding partnership briefing.</h3>
            <p className="text-slate-500 mb-8" style={{ fontFamily: "'Fira Sans', sans-serif" }}>
              Treasury-certified CDFIs only. Our founding team will reach out personally before launch.
              Founding partners shape how the CDFI integration works.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input type="email" aria-label="Your work email" placeholder="Your work email" value={email} onChange={e => setEmail(e.target.value)} required
                className={`w-full px-8 py-5 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 ${RING} text-base font-medium placeholder-slate-400 transition-all`} />
              <input type="text" aria-label="Organization name" placeholder="Organization name" value={orgName} onChange={e => setOrgName(e.target.value)}
                className={`w-full px-8 py-5 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 ${RING} text-base font-medium placeholder-slate-400 transition-all`} />
              <div className="grid sm:grid-cols-2 gap-4">
                <input type="text" aria-label="CDFI Cert #" placeholder="CDFI Cert #" value={cdfiCertNumber} onChange={e => setCdfiCertNumber(e.target.value)}
                  className={`w-full px-8 py-5 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 ${RING} text-base font-medium placeholder-slate-400 transition-all`} />
                <input type="text" aria-label="Primary lending region" placeholder="Primary lending region" value={lendingRegion} onChange={e => setLendingRegion(e.target.value)}
                  className={`w-full px-8 py-5 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 ${RING} text-base font-medium placeholder-slate-400 transition-all`} />
              </div>
              {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
              <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                className="w-full py-5 rounded-2xl font-black text-sm uppercase tracking-wider text-white disabled:opacity-60"
                style={{ background: `linear-gradient(135deg, ${COLOR}, #7a6120)` }}>
                {loading ? 'Submitting…' : 'Request a founding briefing →'}
              </motion.button>
              <p className="text-center text-xs text-slate-400">We'll contact you directly. No spam.</p>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
