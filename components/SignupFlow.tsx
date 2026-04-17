import React, { useState } from 'react';
import { UserRole } from '../types';
import { verifyEntityIntegrity } from '../services/geminiService';
import { authService } from '../services/authService';
import { WelcomeEmailService } from '../services/welcomeEmailService';
import { NonprofitSelector } from './NonprofitSelector';

interface Props {
  onComplete: (email: string, password?: string) => Promise<any>;
  onMerchantOnboarding: () => void;
}

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

  const roleDescriptions = {
    NEIGHBOR: 'Shop local, support community causes, and earn impact credits.',
    MERCHANT: 'List your business and connect with mission-aligned customers.',
    NONPROFIT: 'Register your organization to receive community-directed funding.',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (role === 'MERCHANT') {
      onMerchantOnboarding();
      return;
    }

    // For NEIGHBOR role, show nonprofit selector before completing signup
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

    // Validate nonprofit selection for NEIGHBOR
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

  // Show nonprofit selector modal for NEIGHBOR role
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

  return (
    <div className="space-y-6">
      {/* Role Selector */}
      <div className="flex bg-slate-100 p-1 rounded-2xl">
        {(['NEIGHBOR', 'MERCHANT', 'NONPROFIT'] as const).map(r => (
          <button
            key={r}
            type="button"
            onClick={() => {
              setRole(r);
              setError(null);
              setShowNonprofitSelector(false);
              setSelectedNonprofit('');
            }}
            className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
              role === r ? 'bg-white text-[#7851A9] shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {r === 'NEIGHBOR' ? 'Neighbor' : r === 'MERCHANT' ? 'Merchant' : 'Nonprofit'}
          </button>
        ))}
      </div>
      {/* Role description */}
      <p className="text-xs text-slate-500 font-medium text-center px-4 leading-relaxed">
        {roleDescriptions[role]}
      </p>
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
      <p className="text-[8px] font-bold text-[#7851A9] uppercase tracking-widest ml-2 opacity-70">
        {helper}
      </p>
    )}
  </div>
);
