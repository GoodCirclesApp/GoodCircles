import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { BRAND } from '../lib/brand';

export default function Hero() {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${BRAND.purple} 0%, ${BRAND.lavender} 60%, ${BRAND.gold} 100%)` }}
    >
      {/* Floating orbs */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{ width: 700, height: 700, background: BRAND.emerald, filter: 'blur(140px)', opacity: 0.06, top: '-10%', right: '-10%' }}
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{ width: 500, height: 500, background: BRAND.crimson, filter: 'blur(120px)', opacity: 0.05, bottom: '5%', left: '-5%' }}
        animate={{ x: [0, -20, 0], y: [0, 25, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{ width: 600, height: 600, background: '#fff', filter: 'blur(130px)', opacity: 0.04, top: '40%', left: '30%' }}
        animate={{ x: [0, 15, 0], y: [0, -15, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Brand pill */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="absolute top-24 right-6 sm:right-8 flex items-center gap-2 px-4 py-2 rounded-full"
        style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}
      >
        <span className="text-white text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
          Purpose built for your community
        </span>
      </motion.div>

      {/* Main content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto pt-20">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center mb-10"
        >
          <img src="/logos/logo-white-md.png" alt="GoodCircles" style={{ height: 64, width: 'auto' }} />
        </motion.div>

        {/* The question */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="font-black text-white leading-none mb-6"
          style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', letterSpacing: '-0.02em', lineHeight: 0.95 }}
        >
          What if every dollar{' '}
          <br className="hidden sm:block" />
          you spent built{' '}
          <span style={{ color: BRAND.gold }}>the place you live?</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="text-white/75 text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
          style={{ fontFamily: "'Fira Sans', sans-serif", fontWeight: 500 }}
        >
          GoodCircles is a community marketplace launching{' '}
          <strong className="text-white/90">September 2026.</strong>{' '}
          Shop local, save 10%, and automatically fund the nonprofits you love — all in one place.
        </motion.p>

        {/* Scroll CTA */}
        <motion.a
          href="#mirror-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          onClick={e => {
            e.preventDefault();
            document.getElementById('mirror-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="inline-flex flex-col items-center gap-2 text-white/60 hover:text-white/90 transition-colors cursor-pointer group"
        >
          <span className="text-xs font-black uppercase tracking-widest">Find your circle</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown size={20} />
          </motion.div>
        </motion.a>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.08))' }}
      />
    </section>
  );
}
