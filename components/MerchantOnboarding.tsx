import React, { useState } from 'react';
import { User } from '../types';
import { verifyEntityIntegrity } from '../services/geminiService';

interface MerchantCompleteData extends Partial<User> {
  password?: string;
  ownerName?: string;
  referralCode?: string;
  businessType?: string;
}

interface Props {
  onComplete: (merchantData: MerchantCompleteData) => void;
  onCancel: () => void;
}

export const MerchantOnboarding: React.FC<Props> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    ownerName: '',
    businessName: '',
    email: '',
    password: '',
    taxId: '',
    website: '',
    businessType: 'GOODS' as 'GOODS' | 'SERVICES' | 'BOTH',
    referralCode: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [kybResult, setKybResult] = useState<{
    verified: boolean;
    note: string;
    confidence: number;
    riskFactors: string[];
  } | null>(null);

  const update = (field: string, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const handleNext = async () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setIsLoading(true);
      const result = await verifyEntityIntegrity(formData.businessName, formData.taxId, 'MERCHANT', formData.website);
      setKybResult(result);
      setIsLoading(false);
      setStep(3);
    }
  };

  const handleFinish = () => {
    onComplete({
      name: formData.businessName,
      ownerName: formData.ownerName,
      email: formData.email,
      password: formData.password,
      taxId: formData.taxId,
      businessWebsite: formData.website,
      businessType: formData.businessType,
      referralCode: formData.referralCode,
      role: 'MERCHANT',
    });
  };

  const businessTypeOptions: { label: string; value: 'GOODS' | 'SERVICES' | 'BOTH' }[] = [
    { label: 'Physical Goods / Retail', value: 'GOODS' },
    { label: 'Services', value: 'SERVICES' },
    { label: 'Both Products & Services', value: 'BOTH' },
  ];

  const step1Valid = formData.ownerName.trim() && formData.businessName.trim() && formData.email.trim() && formData.password.length >= 8;
  const step2Valid = formData.taxId.trim();

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Progress Bar */}
      <div className="flex gap-2">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'bg-[#7851A9]' : 'bg-slate-100'}`}
          />
        ))}
      </div>

      {/* Step 1: Business Identity */}
      {step === 1 && (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
          <header>
            <p className="text-[10px] font-black text-[#7851A9] uppercase tracking-widest mb-1">Step 1 of 3</p>
            <h3 className="text-3xl font-black italic uppercase tracking-tighter">Business Identity</h3>
            <p className="text-slate-400 text-sm mt-2 font-medium">
              Tell us about yourself and your business.
            </p>
          </header>
          <div className="space-y-5">
            <InputField
              label="Your Name (Account Holder)"
              value={formData.ownerName}
              onChange={v => update('ownerName', v)}
              placeholder="Jane Smith"
            />
            <InputField
              label="Legal Business Name"
              value={formData.businessName}
              onChange={v => update('businessName', v)}
              placeholder="Smith's Hardware, LLC"
            />
            <InputField
              label="Business Email"
              type="email"
              value={formData.email}
              onChange={v => update('email', v)}
              placeholder="hello@yourbusiness.com"
            />
            <InputField
              label="Account Password"
              type="password"
              value={formData.password}
              onChange={v => update('password', v)}
              placeholder="Min. 8 characters"
            />
          </div>
        </div>
      )}

      {/* Step 2: Compliance */}
      {step === 2 && (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
          <header>
            <p className="text-[10px] font-black text-[#7851A9] uppercase tracking-widest mb-1">Step 2 of 3</p>
            <h3 className="text-3xl font-black italic uppercase tracking-tighter">Compliance & Presence</h3>
            <p className="text-slate-400 text-sm mt-2 font-medium">
              Our Sentinel AI requires legal verification to authorize your listing.
            </p>
          </header>
          <div className="space-y-5">
            <InputField
              label="Federal Tax ID (EIN)"
              value={formData.taxId}
              onChange={v => update('taxId', v)}
              placeholder="XX-XXXXXXX"
            />
            <InputField
              label="Business Website (optional)"
              value={formData.website}
              onChange={v => update('website', v)}
              placeholder="https://www.yourbusiness.com"
            />
            <InputField
              label="Referral Code (optional)"
              value={formData.referralCode}
              onChange={v => update('referralCode', v)}
              placeholder="REF-ORG-XXXXX"
            />
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                What does your business offer?
              </label>
              <div className="space-y-2">
                {businessTypeOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => update('businessType', opt.value)}
                    className={`w-full px-6 py-4 rounded-2xl border text-left text-sm font-bold transition-all ${
                      formData.businessType === opt.value
                        ? 'border-[#7851A9] bg-[#7851A9]/5 text-[#7851A9]'
                        : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: KYB Result */}
      {step === 3 && (
        <div className="space-y-8 animate-in zoom-in duration-500">
          <header className="text-center">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 shadow-2xl ${
              kybResult?.verified ? 'bg-emerald-500' : 'bg-amber-500'
            } text-white`}>
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d={kybResult?.verified
                    ? 'M5 13l4 4L19 7'
                    : 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'}
                />
              </svg>
            </div>
            <p className="text-[10px] font-black text-[#7851A9] uppercase tracking-widest mb-1">Step 3 of 3</p>
            <h3 className="text-3xl font-black italic uppercase tracking-tighter">Verification Complete</h3>
            <p className="text-slate-400 text-sm mt-2 font-medium">
              Sentinel AI has reviewed your credentials.
            </p>
          </header>

          <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <p className="text-[10px] font-black uppercase text-slate-400">Legitimacy Score</p>
              <p className={`text-2xl font-black italic ${
                kybResult?.confidence && kybResult.confidence > 80 ? 'text-emerald-500' : 'text-amber-500'
              }`}>
                {kybResult?.confidence || 0}%
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-slate-400">Audit Note</p>
              <p className="text-sm font-medium text-slate-700 italic">
                "{kybResult?.note || 'Verification complete.'}"
              </p>
            </div>
            {kybResult?.riskFactors && kybResult.riskFactors.length > 0 && (
              <div className="pt-2 space-y-3">
                <p className="text-[10px] font-black uppercase text-red-400">Risk Markers</p>
                <div className="flex flex-wrap gap-2">
                  {kybResult.riskFactors.map((r, i) => (
                    <span key={i} className="px-3 py-1 bg-red-50 text-red-500 text-[10px] font-black uppercase rounded-lg border border-red-100">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
            <p className="text-[10px] font-bold text-emerald-700 uppercase leading-relaxed text-center">
              ✓ Beta accounts are automatically approved and funded. Click below to complete setup.
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 pt-2">
        {step < 3 ? (
          <>
            <button
              type="button"
              onClick={step === 1 ? onCancel : () => setStep(s => s - 1)}
              className="flex-1 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black transition-all"
            >
              {step === 1 ? 'Cancel' : '← Back'}
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={isLoading || (step === 1 && !step1Valid) || (step === 2 && !step2Valid)}
              className="flex-[2] bg-black text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] transition-all shadow-xl disabled:opacity-50"
            >
              {isLoading ? 'Running Verification...' : step === 2 ? 'Run KYB Verification' : 'Continue →'}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={handleFinish}
            className="w-full bg-black text-white py-6 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] transition-all shadow-xl"
          >
            Complete Setup & Access My Account
          </button>
        )}
      </div>
    </div>
  );
};

const InputField = ({
  label, value, onChange, placeholder, type = 'text',
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string;
}) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-8 py-5 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-[#7851A9]/10 outline-none transition-all font-bold"
      placeholder={placeholder}
    />
  </div>
);
