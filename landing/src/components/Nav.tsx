import { motion } from 'framer-motion';

interface NavProps {
  onHoldMySpot: () => void;
}

export default function Nav({ onHoldMySpot }: NavProps) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
      style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <img
          src="/logos/logo-white-md.png"
          alt="GoodCircles"
          style={{ height: 36, width: 'auto' }}
        />
        <div className="flex items-center gap-6">
          <a
            href="#faq"
            className="text-white/70 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors hidden sm:block"
          >
            FAQ
          </a>
          <button
            onClick={onHoldMySpot}
            className="px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.25)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.15)'; }}
          >
            Join the Circle
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
