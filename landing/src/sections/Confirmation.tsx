import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { BRAND, ROLE_CONFIG } from '../lib/brand';
import type { ConfirmationData } from '../App';

interface Props {
  data: ConfirmationData;
}

type InviteTab = 'NEIGHBOR' | 'MERCHANT' | 'NONPROFIT';

const SHARE_COPY: Record<string, string> = {
  NEIGHBOR:  "I just claimed my founding spot in GoodCircles — the community marketplace launching September 2026. Every local purchase saves you 10% and automatically funds the nonprofit you love. Forever. No extra steps. Founding spots are limited:",
  MERCHANT:  "I just claimed my Founding Merchant spot on GoodCircles. Unlike every other platform: keep 89% of net profit, zero algorithm tax on your visibility, and your customers save 10% on every purchase. This is what local business has been waiting for:",
  NONPROFIT: "I just claimed our nonprofit's founding spot on GoodCircles — a marketplace that routes 10% of merchant profit to nonprofits automatically, on every transaction, forever. No fundraising. No grants. Just recurring revenue that grows with the community:",
  CDFI:      "Just requested a founding partnership briefing with GoodCircles — a community marketplace launching September 2026 with live merchant performance data, QIA targeting, and TLR-ready packages built for CDFI underwriting:",
  MUNICIPAL: "Just requested a founding partnership briefing with GoodCircles — a community marketplace launching September 2026 that tracks local spend retention and surfaces small business growth in real time. No new programs. Just the data your community needs:",
};

const EMAIL_SUBJECTS: Record<InviteTab, string> = {
  NEIGHBOR: 'I found something — and I had to tell you',
  MERCHANT: 'A marketplace built for local businesses like yours',
  NONPROFIT: 'Recurring funding — no grant required',
};

function getTemplateBody(role: InviteTab, inviteCode: string): string {
  const code = inviteCode || 'YOUR-INVITE-CODE';
  const link = `https://www.goodcircles.org?ref=${code}`;

  if (role === 'NEIGHBOR') {
    return `Hey,

I just claimed my founding spot in GoodCircles and you were one of the first people I thought to tell.

It's a community marketplace launching September 2026. The short version: you shop local, automatically save 10% on every purchase, and 10% of the merchant's profit flows to the nonprofit of your choice — every transaction, forever, with zero extra effort.

No coupon codes. No extra apps. Just a smarter way to spend money you're already spending.

Use my invite code to claim your founding spot: ${code}

→ ${link}

[Your name]`;
  }

  if (role === 'MERCHANT') {
    return `Hi,

I just claimed my Founding Merchant spot on GoodCircles and thought of your business immediately.

Here's what makes it different from every other platform: you keep 89% of your net profit (compare that to Amazon's ~70% or Etsy's ~80%), your customers save 10% automatically which drives real loyalty, and 10% of your profit goes to local nonprofits as a tax-deductible contribution.

No algorithm charging you to be seen. No race to the bottom on price. A community that actively wants to shop local — and a platform built to make it happen.

Founding Merchant status is permanent. Early merchants earn it once.

Use my invite code to reserve your spot: ${code}

→ ${link}

[Your name]`;
  }

  return `Hi,

I just claimed a founding spot in GoodCircles and your organization was the first thing I thought of.

GoodCircles is a community marketplace launching September 2026. The model: when neighbors shop local through GoodCircles, 10% of every merchant's net profit flows directly to the nonprofit their customers have elected — automatically, on every transaction, forever.

No fundraising events. No grant applications. No donor cultivation. Just recurring revenue that compounds as your community grows.

200 neighbors shopping local can generate over $14,000 a year for your organization.

Use my invite code to claim your nonprofit's founding spot: ${code}

→ ${link}

Founding nonprofits are pre-verified and visible to neighbors from day one.

[Your name]`;
}

export default function Confirmation({ data }: Props) {
  const config = ROLE_CONFIG[data.role];
  const accentColor = config.color;
  const shareText = SHARE_COPY[data.role] ?? SHARE_COPY.NEIGHBOR;
  const shareUrl  = 'https://www.goodcircles.org';
  const fullText  = `${shareText} ${shareUrl}`;

  const [copied, setCopied] = useState<string | null>(null);
  const [inviteTab, setInviteTab] = useState<InviteTab>('NEIGHBOR');
  const [emailCopied, setEmailCopied] = useState(false);

  const inviteCode = data.inviteCode ?? '';
  const [messageBodies, setMessageBodies] = useState<Record<InviteTab, string>>({
    NEIGHBOR: getTemplateBody('NEIGHBOR', inviteCode),
    MERCHANT: getTemplateBody('MERCHANT', inviteCode),
    NONPROFIT: getTemplateBody('NONPROFIT', inviteCode),
  });

  function updateBody(body: string) {
    setMessageBodies(prev => ({ ...prev, [inviteTab]: body }));
  }

  function handleCopyEmail() {
    const subject = EMAIL_SUBJECTS[inviteTab];
    const body = messageBodies[inviteTab];
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 3000);
  }

  const mailtoLink = `mailto:?subject=${encodeURIComponent(EMAIL_SUBJECTS[inviteTab])}&body=${encodeURIComponent(messageBodies[inviteTab])}`;

  function copyWithFeedback(label: string) {
    navigator.clipboard.writeText(fullText);
    setCopied(label);
    setTimeout(() => setCopied(null), 2500);
  }

  function shareX() {
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(fullText)}`, '_blank');
  }
  function shareLinkedIn() {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
  }
  function shareFacebook() {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  }
  function shareWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(fullText)}`, '_blank');
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

  // Overflow screen
  if (data.overflow) {
    return (
      <section
        className="min-h-screen flex flex-col items-center justify-center px-6 py-20"
        style={{ background: `linear-gradient(135deg, ${BRAND.purple} 0%, ${BRAND.lavender} 60%, ${BRAND.gold} 100%)` }}
      >
        <Orbs />
        <div className="relative z-10 max-w-lg w-full text-center">
          <Logo />

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

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="font-black text-white mb-4"
          style={{ fontSize: 'clamp(2rem, 7vw, 3.5rem)', letterSpacing: '-0.02em', lineHeight: 1.05 }}
        >
          You're in the<br />founding circle.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="text-white/75 text-base mb-2 leading-relaxed"
          style={{ fontFamily: "'Fira Sans', sans-serif" }}
        >
          A confirmation is on its way to <strong className="text-white/90">{data.email}</strong>.
          It has your invite code — keep it safe. It's your key to the marketplace at launch.
        </motion.p>

        {/* Invite code */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.85 }}
          className="my-8 px-8 py-5 rounded-2xl mx-auto inline-block"
          style={{ background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(8px)' }}
        >
          <p className="text-xs font-black uppercase tracking-widest text-white/60 mb-1">Your Founding Invite Code</p>
          <p className="text-2xl font-black tracking-widest text-white font-mono">{data.inviteCode}</p>
          <p className="text-[11px] text-white/45 mt-2" style={{ fontFamily: "'Fira Sans', sans-serif" }}>
            Share it — it unlocks founding spots for the people you bring in.
          </p>
        </motion.div>

        {/* Social share */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
        >
          <p className="text-white/50 text-xs font-black uppercase tracking-widest mb-4">Spread the word</p>
          <div className="grid grid-cols-3 gap-3">
            <ShareBtn onClick={shareX}><XIcon /> X</ShareBtn>
            <ShareBtn onClick={shareLinkedIn}><LinkedInIcon /> LinkedIn</ShareBtn>
            <ShareBtn onClick={shareFacebook}><FacebookIcon /> Facebook</ShareBtn>
            <ShareBtn onClick={shareWhatsApp}><WhatsAppIcon /> WhatsApp</ShareBtn>
            <ShareBtn onClick={() => copyWithFeedback('instagram')}>
              <InstagramIcon /> {copied === 'instagram' ? 'Copied!' : 'Instagram'}
            </ShareBtn>
            <ShareBtn onClick={() => copyWithFeedback('tiktok')}>
              <TikTokIcon /> {copied === 'tiktok' ? 'Copied!' : 'TikTok'}
            </ShareBtn>
          </div>
          {(copied === 'instagram' || copied === 'tiktok') && (
            <p className="text-white/60 text-xs mt-3" style={{ fontFamily: "'Fira Sans', sans-serif" }}>
              Link copied — paste it in your {copied === 'instagram' ? 'Instagram story or bio' : 'TikTok bio or video description'}.
            </p>
          )}
        </motion.div>

        {/* Personal invite section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.3 }}
          className="mt-10 pt-8 text-left"
          style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}
        >
          <h3 className="text-white font-black text-lg text-center mb-1">
            Double (or more) your impact
          </h3>
          <p className="text-white/60 text-sm text-center mb-6" style={{ fontFamily: "'Fira Sans', sans-serif" }}>
            by inviting your circle to join your Good Circle
          </p>
          <p className="text-white/45 text-xs text-center mb-6 leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif" }}>
            A personal message converts better than any post. Edit it, make it yours, and send. The more of your community joins before launch, the more GoodCircles is worth to you on day one — more merchants to shop, more neighbors to shop with.
          </p>

          {/* Tab selector */}
          <div className="flex gap-2 mb-5 justify-center flex-wrap">
            {(['NEIGHBOR', 'MERCHANT', 'NONPROFIT'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setInviteTab(tab)}
                className="px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all"
                style={{
                  background: inviteTab === tab ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.07)',
                  border: `1px solid ${inviteTab === tab ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)'}`,
                  color: inviteTab === tab ? '#fff' : 'rgba(255,255,255,0.45)',
                }}
              >
                {tab === 'NEIGHBOR' ? 'Neighbor' : tab === 'MERCHANT' ? 'Local Business' : 'Nonprofit'}
              </button>
            ))}
          </div>

          {/* Subject line */}
          <div className="mb-3">
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Subject line</p>
            <p className="text-white/70 text-sm font-medium" style={{ fontFamily: "'Fira Sans', sans-serif" }}>
              {EMAIL_SUBJECTS[inviteTab]}
            </p>
          </div>

          {/* Editable message body */}
          <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">Message</p>
          <textarea
            value={messageBodies[inviteTab]}
            onChange={e => updateBody(e.target.value)}
            rows={11}
            className="w-full rounded-2xl p-4 text-sm text-slate-800 resize-none mb-4 focus:outline-none"
            style={{
              background: 'rgba(255,255,255,0.93)',
              fontFamily: "'Fira Sans', sans-serif",
              lineHeight: 1.65,
            }}
          />

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCopyEmail}
              className="py-3 rounded-full text-xs font-black uppercase tracking-wider transition-all"
              style={{
                background: emailCopied ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.15)',
                border: `1px solid ${emailCopied ? 'rgba(74,222,128,0.5)' : 'rgba(255,255,255,0.25)'}`,
                color: emailCopied ? '#4ade80' : '#fff',
              }}
            >
              {emailCopied ? '✓ Copied!' : 'Copy full message'}
            </button>
            <a
              href={mailtoLink}
              className="py-3 rounded-full text-xs font-black uppercase tracking-wider text-center transition-all"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.6)',
              }}
            >
              Open in mail app
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ShareBtn({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 px-4 py-3 rounded-full text-xs font-black uppercase tracking-wider text-white transition-all"
      style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.25)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.15)'; }}
    >
      {children}
    </button>
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

function FacebookIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.529 5.845L.057 23.272a.75.75 0 0 0 .92.92l5.427-1.472A11.955 11.955 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.854 0-3.6-.5-5.1-1.373l-.364-.216-3.773 1.023 1.023-3.773-.216-.364A9.955 9.955 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
    </svg>
  );
}
