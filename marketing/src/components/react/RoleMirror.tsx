import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { BRAND, ROLE_CONFIG, type Role, fadeUp } from '../../lib/brand';

interface Props {
  onSelect: (role: Role) => void;
}

const ROLES: Role[] = ['NEIGHBOR', 'MERCHANT', 'NONPROFIT', 'CDFI', 'MUNICIPAL'];

export default function RoleMirror({ onSelect }: Props) {
  return (
    <section className="py-24 px-6" style={{ background: '#FDFCFE' }}>
      <div className="max-w-3xl mx-auto">
        {/* Founding banner */}
        <motion.div
          {...fadeUp(0)}
          className="flex items-center justify-center gap-2 mb-5"
        >
          <motion.span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: '#4ade80' }}
            animate={{ opacity: [1, 0.3, 1], scale: [1, 1.4, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '3px', textTransform: 'uppercase', color: BRAND.purple }}>
            Founding circle is open — September 2026 launch
          </span>
        </motion.div>

        {/* Section label */}
        <motion.p
          {...fadeUp(0.05)}
          className="text-center mb-12"
          style={{ fontSize: 10, fontWeight: 900, letterSpacing: '3px', textTransform: 'uppercase', color: '#aaa' }}
        >
          This is your founding moment. Which is true for you?
        </motion.p>

        {/* Statement cards */}
        <div className="flex flex-col gap-4">
          {ROLES.map((role, i) => {
            const config = ROLE_CONFIG[role];
            return (
              <motion.button
                key={role}
                {...fadeUp(i * 0.1)}
                onClick={() => onSelect(role)}
                className="group w-full text-left rounded-3xl p-7 sm:p-8 border border-slate-100 transition-all duration-200 relative overflow-hidden"
                style={{ background: '#fff' }}
                whileHover={{ y: -2, boxShadow: `0 20px 60px -10px ${config.color}20` }}
                whileTap={{ scale: 0.995 }}
              >
                {/* Left accent strip */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 transition-all duration-200 group-hover:w-1.5 rounded-l-3xl"
                  style={{ background: config.color }}
                />

                <div className="flex items-center justify-between gap-4 pl-3">
                  <p
                    className="font-black text-xl sm:text-2xl leading-snug"
                    style={{ color: '#1a1a1a', letterSpacing: '-0.01em' }}
                  >
                    "{config.statement}"
                  </p>
                  <motion.div
                    className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all"
                    style={{ background: `${config.color}15`, color: config.color }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <ArrowRight size={16} strokeWidth={3} />
                  </motion.div>
                </div>

                <p
                  className="pl-3 mt-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ color: config.color, fontWeight: 600, fontFamily: "'Fira Sans', sans-serif" }}
                >
                  {config.tagline}
                </p>
              </motion.button>
            );
          })}
        </div>

        {/* Small reassurance */}
        <motion.p
          {...fadeUp(0.6)}
          className="text-center mt-10 text-xs text-slate-400"
          style={{ fontFamily: "'Fira Sans', sans-serif" }}
        >
          Founding spots are limited.{' '}
          <span style={{ color: BRAND.purple }}>One email at launch. Unsubscribe anytime.</span>
        </motion.p>
      </div>
    </section>
  );
}
