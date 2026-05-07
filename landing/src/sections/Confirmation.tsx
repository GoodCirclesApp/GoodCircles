import { motion } from 'framer-motion';
import { BRAND, ROLE_CONFIG } from '../lib/brand';
import type { ConfirmationData } from '../App';

interface Props {
  data: ConfirmationData;
}

const SHARE_COPY: Record<string, string> = {
  NEIGHBOR:  "I just joined GoodCircles — a community marketplace launching September 2026 where shopping local saves you 10% and funds nonprofits automatically. Find your circle:",
  MERCHANT:  "I just reserved my spot as a Founding Merchant on GoodCircles, launching September 2026. Keep 89% of net profit and build a community-loyal customer base. Join me:",
  NONPROFIT: "I just reserved our nonprofit's spot on GoodCircles, launching September 2026. A marketplace that routes 10% of merchant profit to nonprofits — automatically. Check it out:",
  CDFI:      "Just requested a partnership briefing with GoodCircles — a community marketplace launching September 2026 with real-time merchant data for CDFI underwriting.",
  MUNICIPAL: "Just requested a partnership briefing with GoodCircles — a community marketplace launching September 2026 that tracks local spend retention and supports small business.",
};

export default function Confirmation({ data }: Props) {
  const config = ROLE_CONFIG[data.role];
  const accentColor = config.color;
  const shareText = SHARE_COPY[data.role] ?? SHARE_COPY.NEIGHBOR;
  const shareUrl  = 'https://www.goodcircles.org';

  function copyLink() {
    navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
  }

  function shareX() {
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, '_blank');
  }

  function shareLinkedIn() {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
  }

  const Orbs = () => (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <motion.div className="absolute rounded-full" style={{ width: 500, height: 500, background: BRAND.emerald, filter: 'blur(120px)', opacity: 0.05, top: '-5%', right: '-5%' }}
        animate={{ x: [0, 20, 0] }} transition={{ duration: 20, repeat: Infinity }} />
      <motion.div className="absolute rounded-full" style={{ width: 400, height: 400, background: '#fff', filter: 'blur(100px)', opacity: 0.04, bottom: '10%', left: '5%' }}
        animate={{ y: [0, -15, 0] }} transition={{ duration: 16, repeat: Infinity }} />
    </div>
  );

  const Logo = () => (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex justify-center mb-10">
      <img src="/logos/logo-white-md.png" alt="GoodCircles" style={{ height: 48, width: 'auto' }} />
    </motion.div>
  );

  // Overflow screen — founding circle is full
  if (data.overflow) {
    return (
      <section
        className="min-h-screen flex flex-col items-center justify-center px-6 py-20"
        style={{ background: `linear-gradient(135deg, ${BRAND.purple} 0%, ${BRAND.lavender} 60%, ${BRAND.gold} 100%)` }}
      >
        <Orbs />
        <div className="relative z-10 max-w-lg w-full text-center">
          <Logo />

          {/* Mail icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
            style={{ background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)' }}
          >
            <motion.svg width="34" height="34" viewBox="0 0 34 34" fill="none"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
              <rect x="3" y="8" width="28" height="20" rx="3" stroke="white" strokeWidth="2.5"/>
              <motion.path d="M3 11 L17 20 L31 11" stroke="white" strokeWidth="2.5" strokeLinecap="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.6, ease: 'easeOut' }}/>
            </motion.svg>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-3xl sm:text-4xl font-black text-white mb-4"
            style={{ letterSpacing: '-0.01em' }}
          >
            You're on the interest list.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="text-white/75 text-base mb-8 leading-relaxed"
            style={{ fontFamily: "'Fira Sans', sans-serif" }}
          >
            Our founding circle is currently full — but we didn't want to lose you.
            We've added <strong className="text-white/90">{data.email}</strong> to the interest list.
            You'll be the first to know the moment a spot opens.
          </motion.p>

          {/* What happens next */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mb-10 px-6 py-5 rounded-2xl mx-auto text-left"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}
          >
            <p className="text-xs font-black uppercase tracking-widest text-white/50 mb-3">What happens next</p>
            <p className="text-sm text-white/80 leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif" }}>
              When a spot opens, you'll receive a direct invitation with a link to claim your place in the founding circle.
              No action needed — just watch your inbox.
            </p>
          </motion.div>
        </div>
      </section>
    );
  }

  // Standard confirmation screen
  return (
    <section
      className="min-h-screen flex flex-col items-center justify-center px-6 py-20"
      style={{ background: `linear-gradient(135deg, ${BRAND.purple} 0%, ${BRAND.lavender} 60%, ${BRAND.gold} 100%)` }}
    >
      <Orbs />

      <div className="relative z-10 max-w-lg w-full text-center">
        <Logo />

        {/* Animated checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
          style={{ background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)' }}
        >
          <motion.svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <motion.path
              d="M6 18 L14 26 L30 10"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.5, ease: 'easeOut' }}
            />
          </motion.svg>
        </motion.div>

        {/* Position */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="font-black leading-none mb-3"
          style={{ fontSize: 'clamp(3rem, 10vw, 5.5rem)', color: BRAND.gold, letterSpacing: '-0.02em' }}
        >
          #{data.position?.toLocaleString()}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="text-3xl sm:text-4xl font-black text-white mb-4"
          style={{ letterSpacing: '-0.01em' }}
        >
          You're in the circle.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="text-white/75 text-base mb-2 leading-relaxed"
          style={{ fontFamily: "'Fira Sans', sans-serif" }}
        >
          We just sent a confirmation to <strong className="text-white/90">{data.email}</strong>.
          It has your invite code — keep it.
        </motion.p>

        {/* Invite code */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.85 }}
          className="my-8 px-8 py-5 rounded-2xl mx-auto inline-block"
          style={{ background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(8px)' }}
        >
          <p className="text-xs font-black uppercase tracking-widest text-white/60 mb-1">Your Invite Code</p>
          <p className="text-2xl font-black tracking-widest text-white font-mono">{data.inviteCode}</p>
        </motion.div>

        {/* Perk blurb */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="mb-10 px-6 py-4 rounded-2xl mx-auto"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
        >
          <p className="text-sm text-white/80 leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif" }}>
            <span style={{ color: accentColor }}>✦</span>{' '}
            {config.tagline}
          </p>
        </motion.div>

        {/* Share buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <p className="text-white/50 text-xs font-black uppercase tracking-widest self-center sm:hidden">Share the circle</p>
          <button onClick={shareX}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.25)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.15)'; }}
          >
            <XIcon /> Share on X
          </button>
          <button onClick={shareLinkedIn}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.25)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.15)'; }}
          >
            <LinkedInIcon /> LinkedIn
          </button>
          <button onClick={copyLink}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.25)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.15)'; }}
          >
            Copy link
          </button>
        </motion.div>
      </div>
    </section>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  );
}
