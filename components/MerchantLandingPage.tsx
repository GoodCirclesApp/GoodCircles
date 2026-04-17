
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight, CheckCircle2, DollarSign, Heart, Users, TrendingUp, ShieldCheck,
  Store, Zap, BarChart3, Globe, Star, ChevronDown, ChevronUp, ArrowUpRight,
  Percent, CreditCard, PieChart, Award
} from 'lucide-react';
import { BrandLogo } from './BrandAssets';

// ═══════════════════════════════════════════════════
// MERCHANT LANDING PAGE
// Public signup funnel — no login required
// Converts local business owners into merchants
// ═══════════════════════════════════════════════════

const BRAND = {
  purple: '#7851A9',
  lavender: '#CA9CE1',
  gold: '#C2A76F',
  crimson: '#A20021',
};

interface MerchantLandingProps {
  onSignUp: () => void;
  onBack: () => void;
}

export const MerchantLandingPage: React.FC<MerchantLandingProps> = ({ onSignUp, onBack }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const fadeUp = (delay: number = 0) => ({
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, delay },
  });

  return (
    <div className="min-h-screen bg-[#FDFCFE] overflow-x-hidden">

      {/* ── Nav Bar ───────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-[#CA9CE1]/20 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BrandLogo variant="GOLD" size="140px" />
            <span className="text-[10px] font-black text-[#7851A9] uppercase tracking-widest hidden md:block">For Merchants</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors">
              Back
            </button>
            <button
              onClick={onSignUp}
              className="px-6 py-2.5 bg-[#7851A9] text-white rounded-xl text-xs font-black uppercase tracking-wider hover:shadow-lg hover:bg-[#6841A0] transition-all"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ─────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#7851A9]/5 rounded-full -mr-96 -mt-96" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#C2A76F]/5 rounded-full -ml-64 -mb-64" />

        <div className="max-w-6xl mx-auto px-6 py-20 md:py-32 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeUp()}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#7851A9]/10 rounded-full mb-8">
                <Zap size={14} className="text-[#7851A9]" />
                <span className="text-[10px] font-black text-[#7851A9] uppercase tracking-widest">The Lowest Fee in the Industry</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-black text-[#1A1A1A] tracking-tight leading-[0.95]">
                Sell More.<br/>
                Keep More.<br/>
                <span className="text-[#7851A9]">Give More.</span>
              </h1>

              <p className="text-xl text-slate-500 mt-8 leading-relaxed max-w-lg">
                Join the marketplace where you pay just <strong className="text-[#7851A9]">1% in fees</strong>, your customers save 10%, and local nonprofits get funded automatically. Everyone wins.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mt-10">
                <button
                  onClick={onSignUp}
                  className="px-8 py-4 bg-[#7851A9] text-white rounded-2xl font-black text-sm uppercase tracking-wider hover:shadow-2xl hover:bg-[#6841A0] transition-all flex items-center justify-center gap-2"
                >
                  Start Selling Today <ArrowRight size={18} />
                </button>
                <a href="#how-it-works"
                  className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-600 rounded-2xl font-black text-sm uppercase tracking-wider hover:border-[#7851A9] hover:text-[#7851A9] transition-all text-center"
                >
                  See How It Works
                </a>
              </div>

              <div className="flex items-center gap-6 mt-10">
                <div className="flex -space-x-2">
                  {['M', 'S', 'L', 'D', 'A'].map((initial, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-[#7851A9] text-white flex items-center justify-center text-[10px] font-black border-2 border-white">
                      {initial}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-400">
                  <strong className="text-slate-700">18+ merchants</strong> already growing with Good Circles
                </p>
              </div>
            </motion.div>

            <motion.div {...fadeUp(0.3)}>
              <div className="bg-white rounded-3xl shadow-2xl border border-[#CA9CE1]/20 p-8 relative">
                <div className="absolute -top-3 -right-3 px-4 py-1.5 bg-[#C2A76F] text-white rounded-full text-[10px] font-black uppercase tracking-wider">
                  Just 1% Fee
                </div>

                <h3 className="text-lg font-black text-[#7851A9] mb-6">Your $100 Sale on Good Circles</h3>

                <div className="space-y-4">
                  {[
                    { label: 'Customer Pays', amount: '$90.00', note: '(they save $10)', color: BRAND.gold, width: '90%' },
                    { label: 'You Receive', amount: '$89.10', note: 'after 1% fee', color: BRAND.purple, width: '89%' },
                    { label: 'Nonprofit Gets', amount: '$3.12', note: 'auto-donated from your profit', color: BRAND.crimson, width: '31%' },
                    { label: 'Platform Fee', amount: '$0.90', note: 'that\'s it — just 1%', color: BRAND.lavender, width: '9%' },
                  ].map((row, i) => (
                    <motion.div key={row.label} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }} viewport={{ once: true }}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-bold text-slate-700">{row.label}</span>
                        <div className="text-right">
                          <span className="text-sm font-black" style={{ color: row.color }}>{row.amount}</span>
                          <span className="text-[10px] text-slate-400 ml-2">{row.note}</span>
                        </div>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: row.width }}
                          transition={{ duration: 0.8, delay: 0.6 + i * 0.1 }}
                          viewport={{ once: true }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: row.color }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-emerald-50 rounded-xl">
                  <p className="text-xs text-emerald-700 font-bold">
                    Compare: Amazon charges 8-15%. Uber Eats charges 15-30%. DoorDash charges 15-25%. Good Circles charges <strong>1%</strong>.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Social Proof Strip ────────────────────────── */}
      <section className="bg-[#7851A9] py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-center gap-8 md:gap-16 text-center">
          {[
            { value: '1%', label: 'Platform Fee' },
            { value: '10%', label: 'Customer Savings' },
            { value: '10%', label: 'Auto-Donated' },
            { value: '$0', label: 'Setup Cost' },
            { value: '24hr', label: 'To Get Started' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-2xl font-black text-white">{s.value}</div>
              <div className="text-[9px] font-bold text-white/50 uppercase tracking-widest">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Benefits Section ──────────────────────────── */}
      <section className="py-20 md:py-28" id="benefits">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div {...fadeUp()} className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-black text-[#1A1A1A] tracking-tight">Why Merchants Love Good Circles</h2>
            <p className="text-slate-500 mt-4 text-lg">Everything you need to grow your business while strengthening your community.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Percent, title: 'Lowest Fees Anywhere', desc: 'Just 1% platform fee. No monthly subscriptions. No per-listing charges. No hidden costs. Keep 89%+ of every sale.', color: BRAND.purple },
              { icon: Users, title: 'Built-In Customers', desc: 'Consumers join Good Circles for the 10% savings. You get access to a growing base of local shoppers who prefer to buy from you.', color: BRAND.gold },
              { icon: Heart, title: 'Community Champion', desc: 'Every sale automatically donates to local nonprofits. Your customers choose which cause to support. You become a community hero.', color: BRAND.crimson },
              { icon: BarChart3, title: 'Business Dashboard', desc: 'Track sales, revenue, the 10/10/1 breakdown, and your community impact — all in one beautiful dashboard.', color: BRAND.purple },
              { icon: CreditCard, title: 'Multiple Payment Options', desc: 'Accept credit cards, platform credits, and QR code payments for in-person sales at markets and pop-ups.', color: BRAND.gold },
              { icon: Store, title: 'Co-op Buying Power', desc: 'Join merchant cooperatives to pool purchasing power. Get better wholesale prices by buying together.', color: BRAND.crimson },
              { icon: TrendingUp, title: 'AI Business Advisor', desc: 'Get personalized insights and recommendations powered by AI to optimize your pricing, inventory, and marketing.', color: BRAND.purple },
              { icon: ShieldCheck, title: 'Verified & Trusted', desc: 'Every merchant is verified. Your listings carry the Good Circles trust badge. Customers know they\'re supporting a real local business.', color: BRAND.gold },
              { icon: Globe, title: 'Grow With Us', desc: 'As Good Circles expands to new cities and states, your products can reach customers beyond your local area.', color: BRAND.crimson },
            ].map((benefit, i) => (
              <motion.div
                key={benefit.title}
                {...fadeUp(i * 0.05)}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:border-[#CA9CE1]/30 transition-all group"
              >
                <div className="p-3 rounded-xl w-fit mb-4 transition-colors" style={{ backgroundColor: benefit.color + '10' }}>
                  <benefit.icon size={22} style={{ color: benefit.color }} />
                </div>
                <h3 className="text-lg font-black text-slate-800 group-hover:text-[#7851A9] transition-colors">{benefit.title}</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────── */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-slate-50 to-white" id="how-it-works">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div {...fadeUp()} className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-black text-[#1A1A1A] tracking-tight">Get Started in 4 Steps</h2>
            <p className="text-slate-500 mt-4 text-lg">From signup to your first sale in less than 24 hours.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Create Account', desc: 'Sign up free with your business email. No credit card required.', icon: Users },
              { step: '2', title: 'Add Your Listings', desc: 'Upload your products or services with photos, descriptions, and pricing.', icon: Store },
              { step: '3', title: 'Connect Payments', desc: 'Link your Stripe account to start receiving payouts directly to your bank.', icon: CreditCard },
              { step: '4', title: 'Start Selling', desc: 'Customers discover you on the marketplace. You sell, they save, nonprofits benefit.', icon: Zap },
            ].map((s, i) => (
              <motion.div key={s.step} {...fadeUp(i * 0.1)} className="relative">
                {i < 3 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-[2px] bg-[#CA9CE1]/20 z-0" />
                )}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative z-10 text-center">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-[#7851A9] text-white flex items-center justify-center text-lg font-black mb-4">
                    {s.step}
                  </div>
                  <s.icon size={28} className="mx-auto text-[#CA9CE1] mb-3" />
                  <h3 className="text-lg font-black text-slate-800">{s.title}</h3>
                  <p className="text-sm text-slate-500 mt-2">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison Table ──────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div {...fadeUp()} className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-4xl font-black text-[#1A1A1A] tracking-tight">See the Difference</h2>
            <p className="text-slate-500 mt-4">Compare Good Circles to other platforms.</p>
          </motion.div>

          <motion.div {...fadeUp(0.2)} className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Feature</th>
                  <th className="px-6 py-5 text-center">
                    <div className="text-xs font-black text-[#7851A9] uppercase tracking-widest">Good Circles</div>
                  </th>
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Amazon</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Etsy</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Shopify</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Platform Fee', gc: '1%', amazon: '8-15%', etsy: '6.5%', shopify: '$39/mo + 2.9%' },
                  { feature: 'Monthly Cost', gc: '$0', amazon: '$39.99', etsy: '$0', shopify: '$39-399' },
                  { feature: 'Customer Discount', gc: '10% auto', amazon: 'None', etsy: 'None', shopify: 'None' },
                  { feature: 'Nonprofit Donations', gc: 'Automatic', amazon: 'Smile ended', etsy: 'None', shopify: 'None' },
                  { feature: 'Local Focus', gc: 'Built-in', amazon: 'No', etsy: 'Partial', shopify: 'No' },
                  { feature: 'Co-op Buying', gc: 'Yes', amazon: 'No', etsy: 'No', shopify: 'No' },
                  { feature: 'AI Advisor', gc: 'Included', amazon: 'No', etsy: 'No', shopify: 'Paid add-on' },
                  { feature: 'QR Payments', gc: 'Included', amazon: 'No', etsy: 'No', shopify: 'Paid add-on' },
                ].map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? 'bg-slate-50/50' : ''}>
                    <td className="px-6 py-4 text-sm font-bold text-slate-700">{row.feature}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-black text-[#7851A9]">{row.gc}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 text-center">{row.amazon}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 text-center">{row.etsy}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 text-center">{row.shopify}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* ── Testimonial / Social Proof ────────────────── */}
      <section className="py-20 bg-gradient-to-r from-[#7851A9] to-[#CA9CE1]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { quote: "I switched from Etsy and saved over $400/month in fees. My customers love the 10% discount — it's brought in so many repeat buyers.", name: "Marco R.", business: "The Harvest Table", stars: 5 },
              { quote: "The fact that my store automatically supports the Community Food Bank with every sale? That's marketing you can't buy. My customers tell their friends about it.", name: "Sarah K.", business: "Farm Fresh Co.", stars: 5 },
              { quote: "I was skeptical about the 1% fee — how do they sustain it? But it's been 6 months and the platform works beautifully. The co-op buying alone has saved me thousands.", name: "Lisa M.", business: "Fix-It Local Plumbing", stars: 5 },
            ].map((testimonial, i) => (
              <motion.div key={i} {...fadeUp(i * 0.1)} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.stars }).map((_, j) => (
                    <Star key={j} size={16} className="text-[#C2A76F] fill-[#C2A76F]" />
                  ))}
                </div>
                <p className="text-sm text-white/90 leading-relaxed italic">"{testimonial.quote}"</p>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-sm font-black">{testimonial.name}</p>
                  <p className="text-[10px] text-white/50 uppercase tracking-widest">{testimonial.business}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ Section ───────────────────────────────── */}
      <section className="py-20 md:py-28" id="faq">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div {...fadeUp()} className="text-center mb-12">
            <h2 className="text-4xl font-black text-[#1A1A1A] tracking-tight">Frequently Asked Questions</h2>
          </motion.div>

          <div className="space-y-3">
            {[
              { q: "How can you charge only 1%?", a: "Good Circles is built for efficiency. We don't have massive warehouse infrastructure, delivery fleets, or expensive ad networks. Our lean technology platform means we can sustain operations on 1% while traditional marketplaces need 8-30%. As transaction volume grows, the 1% scales with us." },
              { q: "Do I need to give 10% of my profit away?", a: "The 10% nonprofit donation comes from your net profit on each sale, not your revenue. And here's the key: your customers specifically choose to shop with you because of this model. The donation drives customer loyalty and repeat business that far exceeds its cost. It's an investment in community goodwill that pays for itself." },
              { q: "How do customers get 10% off?", a: "The 10% discount is applied automatically at checkout. Customers see the discounted price and the nonprofit their purchase supports. This built-in savings is the #1 reason consumers choose Good Circles over other platforms — it brings you more customers." },
              { q: "How do I get paid?", a: "Payments are processed through Stripe Connect. When a customer makes a purchase, the funds are automatically split: your share goes directly to your bank account, the nonprofit share is routed to the selected organization, and the 1% platform fee is collected. Typical payout time is 2-3 business days." },
              { q: "Can I sell at farmers markets and in person?", a: "Yes! Good Circles includes a QR code payment system. Generate a QR code from your Merchant Portal, print it or display it on your phone, and customers scan to pay. The same 10/10/1 model applies to in-person transactions." },
              { q: "What types of businesses can join?", a: "Any legal local business — retail stores, restaurants, service providers (plumbers, tutors, lawyers, etc.), farmers, artisans, and more. Both product-based and service-based businesses are welcome. We verify all merchants to maintain platform quality." },
              { q: "Is there a contract or commitment?", a: "No contracts, no commitments, no setup fees. You can join today, list your products, and leave anytime. We believe in earning your business every day through the value we provide, not locking you in." },
              { q: "What about the co-op buying feature?", a: "Merchants on Good Circles can form cooperatives to pool purchasing power. If several restaurants need olive oil, for example, they can buy together at wholesale prices. This is a feature unique to Good Circles that directly reduces your costs." },
            ].map((faq, i) => (
              <motion.div key={i} {...fadeUp(i * 0.03)} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50/50 transition-colors"
                >
                  <span className="text-sm font-bold text-slate-800 pr-4">{faq.q}</span>
                  {openFaq === i ? <ChevronUp size={18} className="text-[#7851A9] shrink-0" /> : <ChevronDown size={18} className="text-slate-400 shrink-0" />}
                </button>
                {openFaq === i && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="px-5 pb-5">
                    <p className="text-sm text-slate-500 leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-[#7851A9] via-[#7851A9] to-[#CA9CE1] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -mr-48 -mt-48" />

        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div {...fadeUp()}>
            <h2 className="text-5xl font-black text-white tracking-tight leading-tight">
              Ready to Grow Your<br/>Business With Purpose?
            </h2>
            <p className="text-white/70 text-lg mt-6 max-w-xl mx-auto leading-relaxed">
              Join the marketplace that puts local businesses first. No setup fees. No monthly charges. No contracts. Just 1%.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <button
                onClick={onSignUp}
                className="px-10 py-5 bg-white text-[#7851A9] rounded-2xl font-black text-sm uppercase tracking-wider hover:shadow-2xl transition-all flex items-center justify-center gap-2"
              >
                Create Your Free Account <ArrowRight size={18} />
              </button>
            </div>

            <div className="flex flex-wrap justify-center gap-6 mt-10">
              {[
                'No credit card required',
                'Free forever — no monthly fees',
                'Live in 24 hours',
                'Cancel anytime',
              ].map(note => (
                <div key={note} className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#C2A76F]" />
                  <span className="text-white/70 text-xs font-bold">{note}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────── */}
      <footer className="bg-[#1A1A1A] py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <BrandLogo variant="WHITE" size="140px" className="mx-auto" />
          <p className="text-slate-500 text-xs mt-4">Building community, one circle at a time.</p>
          <p className="text-slate-600 text-[10px] mt-2">© 2026 Good Circles. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
