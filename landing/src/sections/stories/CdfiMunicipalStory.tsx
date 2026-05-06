import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Database, MapPin, FileText, Building2 } from 'lucide-react';
import { BRAND, fadeUp } from '../../lib/brand';
import { submitWaitlist, type WaitlistResponse } from '../../lib/api';
import type { ConfirmationData } from '../../App';

type SubRole = 'CDFI' | 'MUNICIPAL';

interface Props {
  role:      SubRole;
  onConfirm: (data: ConfirmationData) => void;
  onBack:    () => void;
}

const CDFI_COLOR     = BRAND.darkGold;
const MUNICIPAL_COLOR = BRAND.navy;

export default function CdfiMunicipalStory({ role: initialRole, onConfirm, onBack }: Props) {
  const [subRole,  setSubRole]  = useState<SubRole>(initialRole);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  // CDFI fields
  const [email,          setEmail]          = useState('');
  const [orgName,        setOrgName]        = useState('');
  const [cdfiCertNumber, setCdfiCertNumber] = useState('');
  const [lendingRegion,  setLendingRegion]  = useState('');

  // Municipal fields
  const [jurisdiction,      setJurisdiction]      = useState('');
  const [decisionMakerRole, setDecisionMakerRole] = useState('');
  const [interestArea,      setInterestArea]      = useState('');

  const COLOR = subRole === 'CDFI' ? CDFI_COLOR : MUNICIPAL_COLOR;
  const RING  = subRole === 'CDFI' ? 'focus:ring-yellow-600/30' : 'focus:ring-blue-900/30';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) { setError('Please enter your email address.'); return; }
    setLoading(true);
    setError('');
    try {
      let res: WaitlistResponse;
      if (subRole === 'CDFI') {
        res = await submitWaitlist({
          role: 'CDFI', email, orgName: orgName || undefined,
          cdfiCertNumber: cdfiCertNumber || undefined,
          lendingRegions: lendingRegion ? [lendingRegion] : undefined,
          requestBriefing: true,
        });
      } else {
        res = await submitWaitlist({
          role: 'MUNICIPAL', email,
          jurisdiction:      jurisdiction || undefined,
          decisionMakerRole: decisionMakerRole || undefined,
          interestArea:      interestArea || undefined,
          requestBriefing:   true,
        });
      }
      onConfirm({ position: res.position, inviteCode: res.inviteCode, role: subRole, email });
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-20 px-6" style={{ background: subRole === 'CDFI' ? '#fdfbf0' : '#f0f4fa' }}>
      <div className="max-w-3xl mx-auto">
        <motion.button {...fadeUp(0)} onClick={onBack} className="flex items-center gap-2 mb-10 text-sm font-bold" style={{ color: COLOR }}>
          <ArrowLeft size={16} strokeWidth={3} /> Back
        </motion.button>

        {/* Sub-role toggle */}
        <motion.div {...fadeUp(0.05)} className="flex gap-3 mb-12 p-1.5 rounded-2xl bg-white border border-slate-200 w-fit">
          {(['CDFI', 'MUNICIPAL'] as SubRole[]).map(r => (
            <button
              key={r}
              onClick={() => setSubRole(r)}
              className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
              style={subRole === r
                ? { background: COLOR, color: '#fff', boxShadow: `0 4px 12px ${COLOR}40` }
                : { color: '#999' }
              }
            >
              {r === 'CDFI' ? 'CDFI / Lender' : 'City / County'}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {subRole === 'CDFI' ? (
            <motion.div key="cdfi"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}>

              <div className="mb-14">
                <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: CDFI_COLOR }}>For CDFIs</p>
                <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight mb-6" style={{ letterSpacing: '-0.02em' }}>
                  Real merchant data.<br />
                  <span style={{ color: CDFI_COLOR }}>Confident underwriting.</span>
                </h2>
                <p className="text-lg text-slate-600 mb-10 leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif" }}>
                  GoodCircles captures real-time transaction volume, revenue trends, and geographic data for
                  every merchant on the platform. Treasury-certified CDFIs get structured access to this
                  pipeline for mission-aligned underwriting — no manual data collection required.
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { icon: <Database size={20} />,  title: 'Live transaction feeds', body: 'Revenue, margin, and neighborhood data updated in real time — not quarterly PDFs.' },
                    { icon: <MapPin size={20} />,    title: 'QIA targeting built-in', body: 'Merchants in Low-to-Moderate Income census tracts are automatically flagged for your pipeline.' },
                    { icon: <FileText size={20} />,  title: 'TLR-ready packages', body: 'Structured merchant performance snapshots mapped to your Transaction Level Report format.' },
                    { icon: <Building2 size={20} />, title: 'Relationship capital', body: 'Merchants already familiar with GoodCircles are pre-engaged — no cold outreach required.' },
                  ].map((card, i) => (
                    <motion.div key={i} {...fadeUp(0.1 + i * 0.07)} className="p-6 rounded-2xl border" style={{ background: '#fff', borderColor: `${CDFI_COLOR}30` }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${CDFI_COLOR}15`, color: CDFI_COLOR }}>
                        {card.icon}
                      </div>
                      <p className="font-black text-slate-900 mb-1">{card.title}</p>
                      <p className="text-sm text-slate-500 leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif" }}>{card.body}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="p-8 rounded-3xl" style={{ background: '#fff', boxShadow: `0 4px 40px ${CDFI_COLOR}20` }}>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Request a partnership briefing.</h3>
                <p className="text-slate-500 mb-8" style={{ fontFamily: "'Fira Sans', sans-serif" }}>
                  Treasury-certified CDFIs only. Our founding team will reach out personally before launch.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <input type="email" placeholder="Your work email" value={email} onChange={e => setEmail(e.target.value)} required
                    className={`w-full px-8 py-5 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 ${RING} text-base font-medium placeholder-slate-400 transition-all`} />
                  <input type="text" placeholder="Organization name" value={orgName} onChange={e => setOrgName(e.target.value)}
                    className={`w-full px-8 py-5 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 ${RING} text-base font-medium placeholder-slate-400 transition-all`} />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input type="text" placeholder="CDFI Cert #" value={cdfiCertNumber} onChange={e => setCdfiCertNumber(e.target.value)}
                      className={`w-full px-8 py-5 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 ${RING} text-base font-medium placeholder-slate-400 transition-all`} />
                    <input type="text" placeholder="Primary lending region" value={lendingRegion} onChange={e => setLendingRegion(e.target.value)}
                      className={`w-full px-8 py-5 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 ${RING} text-base font-medium placeholder-slate-400 transition-all`} />
                  </div>
                  {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
                  <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                    className="w-full py-5 rounded-2xl font-black text-sm uppercase tracking-wider text-white disabled:opacity-60"
                    style={{ background: `linear-gradient(135deg, ${CDFI_COLOR}, #7a6120)` }}>
                    {loading ? 'Submitting…' : 'Request a partnership briefing →'}
                  </motion.button>
                  <p className="text-center text-xs text-slate-400">We'll contact you directly. No spam.</p>
                </form>
              </div>
            </motion.div>
          ) : (
            <motion.div key="municipal"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}>

              <div className="mb-14">
                <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: MUNICIPAL_COLOR }}>For cities & counties</p>
                <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight mb-6" style={{ letterSpacing: '-0.02em' }}>
                  Economic activity<br />
                  <span style={{ color: MUNICIPAL_COLOR }}>that stays home.</span>
                </h2>
                <p className="text-lg text-slate-600 mb-10 leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif" }}>
                  Every GoodCircles transaction is a local dollar that stayed local. Municipal partners get
                  real-time dashboards showing spend retention, GTV, and nonprofit funding within their district
                  — the metrics that tell the economic development story.
                </p>

                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { icon: <BarChart />,      title: 'Spend retention data', body: 'Track the share of resident spending that stays within your district, updated daily.' },
                    { icon: <MapPin size={20} />,  title: 'Hyper-local visibility', body: 'See which neighborhoods and business categories are growing. Make data-driven decisions.' },
                    { icon: <Building2 size={20} />, title: 'No new programs needed', body: 'GoodCircles runs itself. Municipal partners connect their dashboard — no new infrastructure.' },
                  ].map((card, i) => (
                    <motion.div key={i} {...fadeUp(0.1 + i * 0.07)} className="p-6 rounded-2xl border" style={{ background: '#fff', borderColor: `${MUNICIPAL_COLOR}25` }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${MUNICIPAL_COLOR}12`, color: MUNICIPAL_COLOR }}>
                        {card.icon}
                      </div>
                      <p className="font-black text-slate-900 mb-1">{card.title}</p>
                      <p className="text-sm text-slate-500 leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif" }}>{card.body}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="p-8 rounded-3xl" style={{ background: '#fff', boxShadow: `0 4px 40px ${MUNICIPAL_COLOR}18` }}>
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
                    style={{ background: `linear-gradient(135deg, ${MUNICIPAL_COLOR}, #0f2040)` }}>
                    {loading ? 'Submitting…' : 'Request a partnership briefing →'}
                  </motion.button>
                  <p className="text-center text-xs text-slate-400">We'll contact you directly. No spam.</p>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

// Inline icon since lucide doesn't have a perfect "bar chart" that matches our style
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
