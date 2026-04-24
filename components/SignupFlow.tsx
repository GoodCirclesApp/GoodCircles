import React, { useState } from 'react';
import { UserRole } from '../types';
import { verifyEntityIntegrity } from '../services/geminiService';
import { authService } from '../services/authService';
import { WelcomeEmailService } from '../services/welcomeEmailService';
import { NonprofitSelector } from './NonprofitSelector';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onComplete: (email: string, password?: string) => Promise<any>;
  onMerchantOnboarding: () => void;
}

const ROLE_CONFIG: Record<'NEIGHBOR' | 'MERCHANT' | 'NONPROFIT', {
  label: string;
  icon: React.ReactNode;
  tagline: string;
  perks: string[];
  accent: string;
  bg: string;
}> = {
  NEIGHBOR: {
    label: 'Neighbor',
    tagline: 'Shop local, build community.',
    perks: ['10% off every purchase', 'Fund your chosen nonprofit', 'Earn impact credits'],
    accent: 'text-[#7851A9]',
    bg: 'bg-[#7851A9]/5 border-[#7851A9]/30',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  MERCHANT: {
    label: 'Merchant',
    tagline: 'Grow with mission-aligned customers.',
    perks: ['List products & services', 'Build community loyalty', 'Access co-op pricing'],
    accent: 'text-[#C2A76F]',
    bg: 'bg-[#C2A76F]/5 border-[#C2A76F]/30',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
  NONPROFIT: {
    label: 'Nonprofit',
    tagline: 'Receive recurring community funding.',
    perks: ['Auto-directed donations', 'Real-time impact tracking', 'Mission amplification'],
    accent: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-200',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
};

export const SignupFlow: React.FC<Props> = ({ onComplete, onMerchantOnboarding }) => {
  const [role, setRole] = useState<'NEIGHBOR' | 'MERCHANT' | 'NONPROFIT'>('NEIGHBOR');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [selectedNonprofit, setSelectedNonprofit] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNonprofitSelector, setShowNonprofitSelector] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (role === 'MERCHANT') {
      onMerchantOnboarding();
      return;
    }

    if (role === 'NEIGHBOR' && !showNonprofitSelector) {
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please re-enter.');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }
      setShowNonprofitSelector(true);
      return;
    }

    if (role === 'NEIGHBOR' && !selectedNonprofit) {
      setError('Please select a nonprofit to support.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);

    if (role === 'NONPROFIT') {
      if (!taxId.trim()) {
        setError('EIN / Tax-ID is required for nonprofit registration.');
        setIsLoading(false);
        return;
      }
      const integrity = await verifyEntityIntegrity(name, taxId, role);
      if (!integrity.verified || integrity.confidence < 60) {
        setError(`Verification failed: ${integrity.note}`);
        setIsLoading(false);
        return;
      }
    }

    try {
      const finalUser = await authService.register({
        email,
        name,
        role,
        password,
        ...(role === 'NEIGHBOR' && { electedNonprofitId: selectedNonprofit }),
        ...(role === 'NONPROFIT' && { orgName: name, ein: taxId }),
      });
      if (finalUser && finalUser.user) {
        WelcomeEmailService.startSequence({
          id: finalUser.user.id,
          email: finalUser.user.email,
          firstName: name.split(' ')[0],
          role,
        });
      }
      await onComplete(email, password);
    } catch (err: any) {
      console.error('Signup Error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (showNonprofitSelector && role === 'NEIGHBOR') {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-black text-[#7851A9] uppercase tracking-wider mb-2">
            Choose Your Cause
          </h3>
          <p className="text-xs text-slate-600 font-medium mb-6">
            Select a nonprofit to receive 10% of your purchases. You can change this anytime in your profile.
          </p>
        </div>
        <NonprofitSelector
          onSelect={setSelectedNonprofit}
          currentNonprofitId={selectedNonprofit}
        />
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => {
              setShowNonprofitSelector(false);
              setSelectedNonprofit('');
            }}
            className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedNonprofit || isLoading}
            className="flex-1 py-4 rounded-2xl bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] disabled:opacity-50 transition-all"
          >
            {isLoading ? 'Creating account...' : 'Complete Signup →'}
          </button>
        </div>
      </div>
    );
  }

  const conf = ROLE_CONFIG[role];

  return (
    <div className="space-y-6">
      {/* Role Carousel */}
      <div className="space-y-2">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">I am joining as a…</p>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(ROLE_CONFIG) as Array<'NEIGHBOR' | 'MERCHANT' | 'NONPROFIT'>).map(r => {
            const c = ROLE_CONFIG[r];
            const isActive = role === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setRole(r);
                  setError(null);
                  setShowNonprofitSelector(false);
                  setSelectedNonprofit('');
                }}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 text-center transition-all ${
                  isActive
                    ? `border-current ${c.accent} ${c.bg} shadow-md`
                    : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200 hover:text-slate-600'
                }`}
              >
                <span className={isActive ? c.accent : 'text-slate-300'}>
                  {c.icon}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">{c.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="role-active-indicator"
                    className="absolute inset-0 rounded-2xl ring-2 ring-current pointer-events-none"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Role value proposition card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={role}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className={`rounded-2xl border p-4 ${conf.bg}`}
          >
            <p className={`text-xs font-black italic mb-2 ${conf.accent}`}>{conf.tagline}</p>
            <ul className="space-y-1">
              {conf.perks.map(perk => (
                <li key={perk} className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                  <span className={`w-1 h-1 rounded-full ${conf.accent.replace('text-', 'bg-')} shrink-0`} />
                  {perk}
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <SignupInput
          label={role === 'NONPROFIT' ? 'Legal Organization Name' : 'Full Name'}
          value={name}
          onChange={setName}
          placeholder={role === 'NONPROFIT' ? 'Community Food Bank, Inc.' : 'Jane Smith'}
        />
        {role === 'NONPROFIT' && (
          <SignupInput
            label="EIN / Tax-ID Number"
            value={taxId}
            onChange={setTaxId}
            placeholder="XX-XXXXXXX"
            helper="✦ Sentinel AI verification active"
          />
        )}
        <SignupInput
          label="Email Address"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder={role === 'NONPROFIT' ? 'contact@yourorg.org' : 'you@email.com'}
        />
        <SignupInput
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Min. 8 characters"
        />
        {role !== 'MERCHANT' && (
          <SignupInput
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Re-enter your password"
          />
        )}
        {error && (
          <div className="p-4 bg-red-50 text-red-500 text-xs font-bold rounded-2xl border border-red-100">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-6 rounded-2xl bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] disabled:opacity-50 transition-all"
        >
          {isLoading
            ? 'Creating your account...'
            : role === 'MERCHANT'
            ? 'Begin Merchant Onboarding →'
            : 'Continue to Select Cause →'}
        </button>
      </form>
    </div>
  );
};

const SignupInput = ({
  label, value, onChange, placeholder, type = 'text', helper,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  helper?: string;
}) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
      {label}
    </label>
    <input
      type={type}
      required
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-8 py-5 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-[#7851A9]/10 outline-none transition-all font-bold"
      placeholder={placeholder}
    />
    {helper && (
      <p className="text-[10px] font-bold text-[#7851A9] uppercase tracking-widest ml-2 opacity-70">
        {helper}
      </p>
    )}
  </div>
);
