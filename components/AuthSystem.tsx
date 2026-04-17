import React, { useState } from 'react';
import { BrandLogo } from './BrandAssets';
import { generateRecoveryEmailContent } from '../services/geminiService';
import { sendRecoveryEmail } from '../services/emailService';
import { authService } from '../services/authService';
import { WelcomeEmailService } from '../services/welcomeEmailService';
import { MerchantOnboarding } from './MerchantOnboarding';
import { SignupFlow } from './SignupFlow';

interface Props {
  onLogin: (email: string, password?: string) => Promise<any>;
}

export const AuthSystem: React.FC<Props> = ({ onLogin }) => {
  const [view, setView] = useState<'LOGIN' | 'SIGNUP' | 'RECOVERY' | 'MERCHANT_ONBOARDING'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await onLogin(email, password);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const users = JSON.parse(localStorage.getItem('gc_mock_users') || '[]');
    const user = users.find((u: any) => u.email === email);
    if (user) {
      const body = await generateRecoveryEmailContent(user.name, email, user.password);
      await sendRecoveryEmail(email, user.name, body);
      setRecoverySuccess(true);
    } else {
      setError('No account found with that email address.');
    }
    setIsLoading(false);
  };

  const viewTitle: Record<typeof view, string> = {
    LOGIN: 'Login',
    SIGNUP: 'Sign Up',
    RECOVERY: 'Account Recovery',
    MERCHANT_ONBOARDING: 'Merchant Setup',
  };

  return (
    <div className="min-h-screen bg-[#FDFCFE] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#7851A9]/5 rounded-full blur-[120px] -mr-48 -mt-48" />

      <div className="w-full max-w-xl z-10 space-y-12">
        <div className="flex flex-col items-center text-center space-y-6">
          <BrandLogo variant="GOLD" className="transform scale-125 mb-4" />
          <h2 className="text-4xl font-black text-black tracking-tighter italic uppercase">
            {viewTitle[view]}
          </h2>
        </div>

        <div className="bg-white rounded-[4rem] p-12 border border-[#CA9CE1]/20 shadow-2xl space-y-10 relative overflow-hidden">

          {/* Merchant Onboarding */}
          {view === 'MERCHANT_ONBOARDING' && (
            <MerchantOnboarding
              onComplete={async (d) => {
                setIsLoading(true);
                setError(null);
                try {
                  const finalUser = await authService.register({
                    email: d.email!,
                    name: d.ownerName || d.name || '',
                    role: 'MERCHANT',
                    password: d.password,
                    businessName: d.name,
                    businessType: d.businessType as 'GOODS' | 'SERVICES' | 'BOTH',
                    referralCode: d.referralCode,
                  });
                  if (finalUser?.user) {
                    WelcomeEmailService.startSequence({
                      id: finalUser.user.id,
                      email: finalUser.user.email,
                      firstName: (d.ownerName || d.name || '').split(' ')[0],
                      role: 'MERCHANT',
                    });
                  }
                  await onLogin(d.email!, d.password);
                } catch (err: any) {
                  setError(err.message || 'Registration failed. Please try again.');
                  setView('MERCHANT_ONBOARDING');
                } finally {
                  setIsLoading(false);
                }
              }}
              onCancel={() => setView('SIGNUP')}
            />
          )}

          {/* Signup */}
          {view === 'SIGNUP' && (
            <SignupFlow
              onComplete={onLogin}
              onMerchantOnboarding={() => setView('MERCHANT_ONBOARDING')}
            />
          )}

          {/* Login */}
          {view === 'LOGIN' && (
            <form onSubmit={handleLogin} className="space-y-6">
              <LoginInput label="Email" value={email} onChange={setEmail} type="email" />
              <LoginInput label="Secure Key" value={password} onChange={setPassword} type="password" />
              {error && <p className="text-red-500 text-xs font-bold p-3 bg-red-50 rounded-xl">{error}</p>}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-6 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] transition-all disabled:opacity-50"
              >
                {isLoading ? 'Authenticating...' : 'Access Circle'}
              </button>
            </form>
          )}

          {/* Recovery */}
          {view === 'RECOVERY' && !recoverySuccess && (
            <form onSubmit={handleRecovery} className="space-y-6">
              <LoginInput label="Your Email Address" value={email} onChange={setEmail} type="email" />
              {error && <p className="text-red-500 text-xs font-bold p-3 bg-red-50 rounded-xl">{error}</p>}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-6 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] transition-all disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Send Recovery Link'}
              </button>
            </form>
          )}
          {view === 'RECOVERY' && recoverySuccess && (
            <p className="text-center font-bold text-emerald-500 py-4">
              Recovery instructions sent — check your inbox.
            </p>
          )}

          {/* Bottom nav */}
          <div className="text-center pt-2 space-y-4">
            <button
              onClick={() => { setView(view === 'LOGIN' ? 'SIGNUP' : 'LOGIN'); setError(null); }}
              className="text-[#7851A9] text-[10px] font-black uppercase tracking-widest hover:underline"
            >
              {view === 'LOGIN' ? 'New here? Create an account' : '← Back to Login'}
            </button>
            {view === 'LOGIN' && (
              <button
                onClick={() => { setView('RECOVERY'); setError(null); }}
                className="block mx-auto text-[8px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600"
              >
                Forgot Key?
              </button>
            )}
          </div>

        
        </div>
      </div>
    </div>
  );
};

const LoginInput = ({ label, value, onChange, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; type?: string;
}) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{label}</label>
    <input
      type={type}
      required
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-8 py-5 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-[#7851A9]/10 outline-none transition-all font-bold text-base"
    />
  </div>
);
