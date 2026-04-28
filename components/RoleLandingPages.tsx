import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight, CheckCircle2, Heart, Users, TrendingUp, ShieldCheck,
  Zap, Globe, DollarSign, Store, BarChart3, Building2, Landmark,
  HandCoins, Percent, MapPin, FileCheck, ClipboardList, Activity,
} from 'lucide-react';
import { BrandLogo } from './BrandAssets';

// ─── Shared primitives ────────────────────────────────────────────────────────

const BRAND = {
  purple:   '#7851A9',
  lavender: '#CA9CE1',
  gold:     '#C2A76F',
  crimson:  '#A20021',
  emerald:  '#059669',
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay },
});

interface LandingProps {
  onBack: () => void;
  onSignUp: () => void;
}

function LandingNav({
  label, ctaLabel, accent, onBack, onSignUp,
}: { label: string; ctaLabel: string; accent: string; onBack: () => void; onSignUp: () => void }) {
  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BrandLogo variant="GOLD" size="140px" />
          <span className="text-[10px] font-black uppercase tracking-widest hidden md:block" style={{ color: accent }}>{label}</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">Back</button>
          <button onClick={onSignUp} className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white hover:shadow-lg transition-all" style={{ background: accent }}>
            {ctaLabel}
          </button>
        </div>
      </div>
    </nav>
  );
}

function FeatureCard({ icon: Icon, title, body, accent }: { icon: any; title: string; body: string; accent: string }) {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: `${accent}15` }}>
        <Icon size={22} style={{ color: accent }} />
      </div>
      <h3 className="text-lg font-black text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{body}</p>
    </div>
  );
}

function StepRow({ steps, accent }: { steps: { n: string; text: string }[]; accent: string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
      {steps.map((s) => (
        <div key={s.n} className="flex items-start gap-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white text-sm font-black" style={{ background: accent }}>{s.n}</div>
          <p className="text-slate-600 text-sm leading-relaxed pt-1">{s.text}</p>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// NEIGHBOR (CONSUMER) LANDING PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export const NeighborLandingPage: React.FC<LandingProps> = ({ onBack, onSignUp }) => (
  <div className="min-h-screen bg-[#FDFCFE] overflow-x-hidden">
    <LandingNav label="For Neighbors" ctaLabel="Join Free →" accent={BRAND.emerald} onBack={onBack} onSignUp={onSignUp} />

    {/* Hero */}
    <section className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-emerald-500/5 rounded-full -mr-80 -mt-80" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#7851A9]/5 rounded-full -ml-56 -mb-56" />
      <div className="max-w-6xl mx-auto px-6 py-20 md:py-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div {...fadeUp()}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full mb-8">
              <Zap size={13} className="text-emerald-600" />
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Save 10% on Every Purchase</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-[#1A1A1A] tracking-tight leading-[0.95]">
              Shop Local.<br />
              Save More.<br />
              <span style={{ color: BRAND.emerald }}>Give Back.</span>
            </h1>
            <p className="text-xl text-slate-500 mt-8 leading-relaxed max-w-lg">
              Every purchase earns you a <strong className="text-slate-700">10% discount</strong> and automatically funds the nonprofit you love — with zero extra steps.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-10">
              <button onClick={onSignUp} className="px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-white hover:shadow-2xl transition-all flex items-center justify-center gap-2" style={{ background: BRAND.emerald }}>
                Join Free <ArrowRight size={18} />
              </button>
            </div>
            <div className="flex items-center gap-6 mt-10">
              <div className="flex -space-x-2">
                {['A', 'B', 'C', 'D', 'E'].map((l, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black border-2 border-white">{l}</div>
                ))}
              </div>
              <p className="text-xs text-slate-400"><strong className="text-slate-700">Hundreds of neighbors</strong> already saving and giving</p>
            </div>
          </motion.div>

          <motion.div {...fadeUp(0.25)}>
            <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 p-8">
              <div className="absolute -top-3 -right-3" />
              <h3 className="text-lg font-black text-emerald-700 mb-6">Your $100 Purchase on Good Circles</h3>
              <div className="space-y-4">
                {[
                  { label: 'You Pay',          amount: '$90.00', note: '10% off — always',        bar: '90%',  color: BRAND.emerald },
                  { label: 'You Save',         amount: '$10.00', note: 'instant price reduction',  bar: '10%',  color: BRAND.purple },
                  { label: 'Nonprofit Funded', amount: '$3.12',  note: 'from merchant profit',     bar: '31%',  color: BRAND.crimson },
                  { label: 'Your Platform Fee', amount: '$0.00', note: 'free forever',             bar: '0%',   color: '#94a3b8' },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-bold text-slate-700">{row.label}</span>
                      <span className="font-black" style={{ color: row.color }}>{row.amount} <span className="text-slate-400 font-normal">— {row.note}</span></span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full"><div className="h-full rounded-full" style={{ width: row.bar, background: row.color }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="bg-slate-50 py-20">
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2 {...fadeUp()} className="text-4xl font-black text-center tracking-tight mb-12">
          Everything included. <span style={{ color: BRAND.emerald }}>Always free.</span>
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div {...fadeUp(0.1)}><FeatureCard icon={Percent} title="10% Off Every Time" body="No coupon codes, no minimums, no expiry. Your discount is built into every transaction on Good Circles — automatically." accent={BRAND.emerald} /></motion.div>
          <motion.div {...fadeUp(0.2)}><FeatureCard icon={Heart} title="Fund What You Love" body="Elect a local nonprofit when you sign up. 10% of merchant profit flows directly to your cause on every purchase — you never pay extra." accent={BRAND.crimson} /></motion.div>
          <motion.div {...fadeUp(0.3)}><FeatureCard icon={Activity} title="Track Your Impact" body="Your personal impact dashboard shows exactly how much you've saved and donated. Share your impact badge with friends." accent={BRAND.purple} /></motion.div>
        </div>
        <StepRow accent={BRAND.emerald} steps={[
          { n: '1', text: 'Create your free account and elect a local nonprofit to support.' },
          { n: '2', text: 'Shop from local merchants in the Good Circles marketplace.' },
          { n: '3', text: 'Pay 10% less. Your nonprofit gets funded. You track every dollar.' },
        ]} />
      </div>
    </section>

    {/* CTA */}
    <section className="py-20">
      <div className="max-w-xl mx-auto px-6 text-center">
        <motion.div {...fadeUp()}>
          <h2 className="text-4xl font-black tracking-tight mb-4">Ready to shop with purpose?</h2>
          <p className="text-slate-400 mb-8">Join for free. Save immediately. No credit card required.</p>
          <button onClick={onSignUp} className="px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-white hover:shadow-2xl transition-all" style={{ background: BRAND.emerald }}>
            Create Your Free Account →
          </button>
        </motion.div>
      </div>
    </section>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// NONPROFIT LANDING PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export const NonprofitLandingPage: React.FC<LandingProps> = ({ onBack, onSignUp }) => (
  <div className="min-h-screen bg-[#FDFCFE] overflow-x-hidden">
    <LandingNav label="For Nonprofits" ctaLabel="Register Your Nonprofit →" accent={BRAND.crimson} onBack={onBack} onSignUp={onSignUp} />

    {/* Hero */}
    <section className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-[#A20021]/4 rounded-full -mr-80 -mt-80" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#7851A9]/5 rounded-full -ml-56 -mb-56" />
      <div className="max-w-6xl mx-auto px-6 py-20 md:py-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div {...fadeUp()}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8" style={{ background: `${BRAND.crimson}12` }}>
              <Heart size={13} style={{ color: BRAND.crimson }} />
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: BRAND.crimson }}>Passive Funding — No Overhead</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-[#1A1A1A] tracking-tight leading-[0.95]">
              Turn Everyday<br />
              Shopping Into<br />
              <span style={{ color: BRAND.crimson }}>Your Mission.</span>
            </h1>
            <p className="text-xl text-slate-500 mt-8 leading-relaxed max-w-lg">
              When neighbors shop local on Good Circles and elect your nonprofit, <strong className="text-slate-700">10% of merchant profit flows directly to you</strong> — automatically, every transaction.
            </p>
            <button onClick={onSignUp} className="mt-10 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-white hover:shadow-2xl transition-all flex items-center gap-2" style={{ background: BRAND.crimson }}>
              Register Your Nonprofit <ArrowRight size={18} />
            </button>
          </motion.div>

          <motion.div {...fadeUp(0.25)}>
            <div className="bg-white rounded-3xl shadow-2xl border p-8 space-y-5" style={{ borderColor: `${BRAND.crimson}20` }}>
              <h3 className="text-lg font-black mb-2" style={{ color: BRAND.crimson }}>How Your Funding Works</h3>
              {[
                { emoji: '🏪', label: 'Merchant completes a $100 sale', note: '' },
                { emoji: '💸', label: '$10.10 gross profit allocated', note: 'after 10% discount + 1% fee' },
                { emoji: '❤️', label: '$3.12 sent to your nonprofit', note: '~10% of gross profit — automatically' },
                { emoji: '📊', label: 'You see it in your dashboard', note: 'real-time, no paperwork' },
              ].map((row) => (
                <div key={row.label} className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">{row.emoji}</span>
                  <div>
                    <div className="text-sm font-bold text-slate-800">{row.label}</div>
                    {row.note && <div className="text-xs text-slate-400">{row.note}</div>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="bg-slate-50 py-20">
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2 {...fadeUp()} className="text-4xl font-black text-center tracking-tight mb-12">
          Zero fundraising overhead. <span style={{ color: BRAND.crimson }}>100% mission focus.</span>
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div {...fadeUp(0.1)}><FeatureCard icon={HandCoins} title="Automatic Donation Routing" body="Every qualifying transaction routes 10% of merchant profit to your cause. No invoicing, no check runs, no grant cycles." accent={BRAND.crimson} /></motion.div>
          <motion.div {...fadeUp(0.2)}><FeatureCard icon={BarChart3} title="Real-Time Impact Dashboard" body="Track donations by merchant, by day, by category. Download your payout history for board reporting and audits." accent={BRAND.purple} /></motion.div>
          <motion.div {...fadeUp(0.3)}><FeatureCard icon={Users} title="Merchant Referral Bonuses" body="Refer local businesses to Good Circles. Every merchant you recruit increases your funding stream — and earns you milestone bonuses." accent={BRAND.gold} /></motion.div>
        </div>
        <StepRow accent={BRAND.crimson} steps={[
          { n: '1', text: 'Register with your EIN. We verify your 501(c)(3) status — typically within 24 hours.' },
          { n: '2', text: 'Share your referral code with local merchants and neighbors in your community.' },
          { n: '3', text: 'Receive automatic quarterly payouts directly to your organization.' },
        ]} />
      </div>
    </section>

    {/* CTA */}
    <section className="py-20">
      <div className="max-w-xl mx-auto px-6 text-center">
        <motion.div {...fadeUp()}>
          <h2 className="text-4xl font-black tracking-tight mb-4">Your community is already shopping.</h2>
          <p className="text-slate-400 mb-8">Make sure your nonprofit is there to receive the funding.</p>
          <button onClick={onSignUp} className="px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-white hover:shadow-2xl transition-all" style={{ background: BRAND.crimson }}>
            Register Your Organization →
          </button>
        </motion.div>
      </div>
    </section>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// CDFI LANDING PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export const CdfiLandingPage: React.FC<LandingProps> = ({ onBack, onSignUp }) => (
  <div className="min-h-screen bg-[#FDFCFE] overflow-x-hidden">
    <LandingNav label="CDFI Partnership" ctaLabel="Apply for Partnership →" accent={BRAND.gold} onBack={onBack} onSignUp={onSignUp} />

    {/* Hero */}
    <section className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full -mr-80 -mt-80" style={{ background: `${BRAND.gold}08` }} />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full -ml-56 -mb-56" style={{ background: `${BRAND.purple}06` }} />
      <div className="max-w-6xl mx-auto px-6 py-20 md:py-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div {...fadeUp()}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8" style={{ background: `${BRAND.gold}14` }}>
              <Landmark size={13} style={{ color: BRAND.gold }} />
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#9a7d3a' }}>CDFI Fund Treasury-Certified Partners</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-[#1A1A1A] tracking-tight leading-[0.95]">
              Deploy Capital<br />
              Where It Creates<br />
              <span style={{ color: BRAND.gold }}>Real Impact.</span>
            </h1>
            <p className="text-xl text-slate-500 mt-8 leading-relaxed max-w-lg">
              Good Circles generates real-time merchant transaction data, census tract intelligence, and a <strong className="text-slate-700">first-loss reserve pool</strong> — giving your CDFI the underwriting confidence to lend where others won't.
            </p>
            <button onClick={onSignUp} className="mt-10 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-white hover:shadow-2xl transition-all flex items-center gap-2" style={{ background: BRAND.gold }}>
              Apply for Partnership <ArrowRight size={18} />
            </button>
            <p className="text-xs text-slate-400 mt-4">Applications reviewed within 1–2 business days. Treasury certification required.</p>
          </motion.div>

          <motion.div {...fadeUp(0.25)}>
            <div className="bg-white rounded-3xl shadow-2xl border p-8 space-y-5" style={{ borderColor: `${BRAND.gold}25` }}>
              <h3 className="text-lg font-black mb-2" style={{ color: '#9a7d3a' }}>What You Get Access To</h3>
              {[
                { icon: BarChart3, label: 'Merchant transaction history',        note: 'Gross revenue, category, volume trends' },
                { icon: MapPin,    label: 'Census tract eligibility data',        note: 'Qualified Investment Area mapping' },
                { icon: ShieldCheck, label: 'First-loss reserve pool',           note: '5% of every affiliate conversion earmarked' },
                { icon: FileCheck, label: 'Automated packaging reports',          note: 'Merchant profiles ready for TLR submission' },
                { icon: ClipboardList, label: 'New Markets Tax Credit signals',   note: 'NMTC and CDFI-specific scoring' },
              ].map((row) => (
                <div key={row.label} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${BRAND.gold}15` }}>
                    <row.icon size={15} style={{ color: BRAND.gold }} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">{row.label}</div>
                    <div className="text-xs text-slate-400">{row.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="bg-slate-50 py-20">
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2 {...fadeUp()} className="text-4xl font-black text-center tracking-tight mb-12">
          The infrastructure your loan officers <span style={{ color: BRAND.gold }}>have been waiting for.</span>
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div {...fadeUp(0.1)}><FeatureCard icon={TrendingUp} title="Continuous Merchant Monitoring" body="Real-time transaction feeds update merchant profiles automatically. Know when a borrower crosses your milestone thresholds — before you ask." accent={BRAND.gold} /></motion.div>
          <motion.div {...fadeUp(0.2)}><FeatureCard icon={ShieldCheck} title="First-Loss Pool Architecture" body="5% of every affiliate commission flows into a dedicated reserve fund. Reduce your credit risk on underserved business loans with structural protection." accent={BRAND.purple} /></motion.div>
          <motion.div {...fadeUp(0.3)}><FeatureCard icon={Globe} title="Geographic Impact Verification" body="Census tract overlays and QIA mapping are built in — so you can prove community impact for federal reporting without extra data collection." accent={BRAND.crimson} /></motion.div>
        </div>
        <StepRow accent={BRAND.gold} steps={[
          { n: '1', text: 'Apply with your CDFI certification number. Admin review within 48 hours.' },
          { n: '2', text: 'Configure your target census tracts, lending criteria, and reporting preferences.' },
          { n: '3', text: 'Access the merchant packaging dashboard and begin deploying capital with confidence.' },
        ]} />
      </div>
    </section>

    {/* CTA */}
    <section className="py-20">
      <div className="max-w-xl mx-auto px-6 text-center">
        <motion.div {...fadeUp()}>
          <h2 className="text-4xl font-black tracking-tight mb-4">The data to lend confidently. Finally.</h2>
          <p className="text-slate-400 mb-8">CDFI Fund certification required. Applications are reviewed by our partnership team.</p>
          <button onClick={onSignUp} className="px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-white hover:shadow-2xl transition-all" style={{ background: BRAND.gold }}>
            Submit Your CDFI Application →
          </button>
        </motion.div>
      </div>
    </section>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MUNICIPAL LANDING PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export const MunicipalLandingPage: React.FC<LandingProps> = ({ onBack, onSignUp }) => (
  <div className="min-h-screen bg-[#FDFCFE] overflow-x-hidden">
    <LandingNav label="Municipal Partnership" ctaLabel="Express Interest →" accent="#1e3a5f" onBack={onBack} onSignUp={onSignUp} />

    {/* Hero */}
    <section className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full -mr-80 -mt-80" style={{ background: '#1e3a5f08' }} />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full -ml-56 -mb-56" style={{ background: `${BRAND.gold}06` }} />
      <div className="max-w-6xl mx-auto px-6 py-20 md:py-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div {...fadeUp()}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8" style={{ background: '#1e3a5f12' }}>
              <Building2 size={13} style={{ color: '#1e3a5f' }} />
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#1e3a5f' }}>For City & County Governments</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-[#1A1A1A] tracking-tight leading-[0.95]">
              Bring Good<br />
              Circles to<br />
              <span style={{ color: '#1e3a5f' }}>Your City.</span>
            </h1>
            <p className="text-xl text-slate-500 mt-8 leading-relaxed max-w-lg">
              Partner with Good Circles to build a self-sustaining local economy — where every transaction <strong className="text-slate-700">keeps dollars in your district</strong>, funds community organizations, and generates real economic data for planners.
            </p>
            <button onClick={onSignUp} className="mt-10 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-white hover:shadow-2xl transition-all flex items-center gap-2" style={{ background: '#1e3a5f' }}>
              Express Partnership Interest <ArrowRight size={18} />
            </button>
            <p className="text-xs text-slate-400 mt-4">Municipal partnerships are reviewed by our government relations team. Response within 3 business days.</p>
          </motion.div>

          <motion.div {...fadeUp(0.25)}>
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 space-y-5">
              <h3 className="text-lg font-black mb-2" style={{ color: '#1e3a5f' }}>The Good Circles Economic Model</h3>
              {[
                { label: 'Local spend retained',    value: '~89%', note: 'of every transaction stays local' },
                { label: 'Nonprofit funding',       value: '~3%',  note: 'of GTV flows to community orgs' },
                { label: 'Merchant growth',         value: '1% fee', note: 'lowest barrier to digital commerce' },
                { label: 'Economic data for city',  value: 'Real-time', note: 'GTV, jobs, spend by category & census tract' },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div>
                    <div className="text-sm font-bold text-slate-800">{row.label}</div>
                    <div className="text-xs text-slate-400">{row.note}</div>
                  </div>
                  <div className="text-lg font-black" style={{ color: '#1e3a5f' }}>{row.value}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="bg-slate-50 py-20">
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2 {...fadeUp()} className="text-4xl font-black text-center tracking-tight mb-12">
          Economic development infrastructure <span style={{ color: '#1e3a5f' }}>that runs itself.</span>
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div {...fadeUp(0.1)}><FeatureCard icon={Store} title="Local Merchant Network" body="Good Circles onboards and verifies local businesses in your district — giving residents a curated marketplace of trusted neighborhood vendors." accent="#1e3a5f" /></motion.div>
          <motion.div {...fadeUp(0.2)}><FeatureCard icon={Globe} title="Regional Impact Reporting" body="Real-time GTV by census tract, nonprofit funding totals, and merchant growth data — exportable for CDBG, HUD, and municipal reporting requirements." accent={BRAND.gold} /></motion.div>
          <motion.div {...fadeUp(0.3)}><FeatureCard icon={DollarSign} title="Fiscal Policy Integration" body="Configure region-specific discount rates, nonprofit allocation percentages, and tax incentive eligibility criteria through the municipal partner portal." accent={BRAND.emerald} /></motion.div>
        </div>
        <StepRow accent="#1e3a5f" steps={[
          { n: '1', text: 'Express interest. Our government relations team will schedule a briefing within 72 hours.' },
          { n: '2', text: 'Define your region, partner nonprofits, and any local fiscal policy parameters.' },
          { n: '3', text: 'Launch. Residents and merchants onboard through the existing Good Circles platform.' },
        ]} />
      </div>
    </section>

    {/* Policy alignment callout */}
    <section className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div {...fadeUp()} className="bg-[#1e3a5f] rounded-3xl p-10 text-white text-center">
          <h2 className="text-3xl font-black mb-4">Aligned with CDBG, HUD, and NMTC criteria</h2>
          <p className="text-slate-300 text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
            Good Circles captures the community development data federal programs require — census tract economic activity, low-income community investment, and local job support metrics — as a native output of normal marketplace operations.
          </p>
          <button onClick={onSignUp} className="px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-wider bg-white hover:shadow-2xl transition-all" style={{ color: '#1e3a5f' }}>
            Schedule a Government Relations Briefing →
          </button>
        </motion.div>
      </div>
    </section>
  </div>
);
