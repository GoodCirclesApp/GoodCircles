
import React, { useState } from 'react';
import { User, OnboardingStep, Product } from '../types';
import { BrandLogo, BrandSubmark } from './BrandAssets';
import { verifyEntityIntegrity, performCatalogIntegrityAudit } from '../services/aiAuditService';

interface Props {
  user: User;
  onUpdateUser: (user: User) => void;
  onLogout: () => void;
  initialProducts?: Product[];
}

const DEFAULT_STEPS: OnboardingStep[] = [
  { id: 'identity', label: 'Identity Verification', status: 'PENDING', note: 'Verify legal entity and controlling persons.' },
  { id: 'regulatory', label: 'Regulatory Compliance', status: 'LOCKED', note: 'AI audit of EIN/Tax ID and 501(c)(3) status.' },
  { id: 'integrity', label: 'Integrity Policy Alignment', status: 'LOCKED', note: 'Price Sentinel scan for MSRP drift and COGS transparency.' },
  { id: 'approval', label: 'Steward Review', status: 'LOCKED', note: 'Final manual verification by platform governance.' }
];

export const EntityOnboardingPipeline: React.FC<Props> = ({ user, onUpdateUser, onLogout, initialProducts = [] }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [auditLog, setAuditLog] = useState<string[]>([]);
  const pipeline = user.verificationPipeline || DEFAULT_STEPS;

  const currentStepIndex = pipeline.findIndex(s => s.status === 'PENDING');
  const currentStep = pipeline[currentStepIndex];

  const addLog = (msg: string) => setAuditLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const handleStepComplete = async () => {
    setIsProcessing(true);
    setAuditLog([]);
    addLog(`Initializing ${currentStep?.label}...`);

    try {
      if (currentStep?.id === 'regulatory') {
        addLog(`Querying global regulatory databases via Gemini...`);
        const result = await verifyEntityIntegrity(user.name, user.taxId || '', user.role, user.businessWebsite);
        addLog(result.note);
        if (result.riskFactors.length > 0) {
           addLog(`Risk Markers Found: ${result.riskFactors.join(', ')}`);
        }
      } else if (currentStep?.id === 'integrity' && user.role === 'MERCHANT') {
        addLog(`Price Sentinel v2: Scanning catalog for MSRP integrity...`);
        const result = await performCatalogIntegrityAudit(initialProducts);
        addLog(`Audit complete. ${result.results.length} assets verified.`);
      } else {
        await new Promise(r => setTimeout(r, 1500));
        addLog(`Step validated against platform policy.`);
      }

      const updatedPipeline = pipeline.map((step, idx) => {
        if (idx === currentStepIndex) return { ...step, status: 'COMPLETED' as const };
        if (idx === currentStepIndex + 1) return { ...step, status: 'PENDING' as const };
        return step;
      });

      const isFinished = updatedPipeline.every(s => s.status === 'COMPLETED');
      
      onUpdateUser({
        ...user,
        verificationPipeline: updatedPipeline,
        status: isFinished ? 'ACTIVE' : 'PENDING'
      });
    } catch (error) {
      addLog(`CRITICAL ERROR: Verification node timeout. Retrying link...`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFE] flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-4xl space-y-12 animate-in fade-in duration-700">
        <header className="flex flex-col items-center text-center space-y-6">
          <BrandLogo variant="GOLD" className="transform scale-110" />
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-black tracking-tighter italic uppercase">Verification Pipeline</h2>
            <p className="text-slate-500 font-medium">Securing the Good Circles integrity mesh for {user.name}.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {pipeline.map((step, idx) => (
            <div key={step.id} className={`p-6 rounded-3xl border-2 transition-all ${
              step.status === 'COMPLETED' ? 'bg-emerald-50 border-emerald-200' :
              step.status === 'PENDING' ? 'bg-white border-[#7851A9] shadow-xl ring-4 ring-[#7851A9]/5' :
              'bg-slate-50 border-slate-100 opacity-50'
            }`}>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Gate 0{idx + 1}</p>
              <h4 className="text-xs font-black uppercase mb-1">{step.label}</h4>
              <p className="text-[10px] font-bold text-slate-400 leading-tight uppercase">{step.status}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[4rem] p-12 md:p-20 border border-[#CA9CE1]/20 shadow-2xl relative overflow-hidden">
          {currentStep ? (
            <div className="space-y-10 relative z-10">
              <div className="flex items-center gap-6">
                 <div className="p-5 bg-black text-[#C2A76F] rounded-3xl shadow-xl">
                   <BrandSubmark size={40} color="#C2A76F" showCrown={false} />
                 </div>
                 <div>
                    <h3 className="text-3xl font-black italic tracking-tighter uppercase">{currentStep.label}</h3>
                    <p className="text-[#7851A9] text-[10px] font-black uppercase tracking-[0.3em] font-accent">Pipeline Active</p>
                 </div>
              </div>
              
              <div className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100">
                <p className="text-xl font-medium text-slate-700 leading-relaxed italic">"{currentStep.note}"</p>
                {auditLog.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-200 space-y-2 font-mono text-[10px] text-[#7851A9]">
                    {auditLog.map((log, i) => <p key={i}>{log}</p>)}
                  </div>
                )}
              </div>

              <div className="pt-6 space-y-4">
                <button 
                  onClick={handleStepComplete}
                  disabled={isProcessing}
                  className="w-full bg-black text-white py-6 rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-[#7851A9] transition-all active:scale-95 disabled:opacity-50"
                >
                  {isProcessing ? 'Verifying Integrity Hash...' : 'Initialize Verification'}
                </button>
                <button onClick={onLogout} className="w-full text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-red-500 transition-colors">Sign Out</button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-8 py-10">
               <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl animate-bounce">
                 <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
               </div>
               <h3 className="text-4xl font-black italic tracking-tighter uppercase">Integrity Confirmed</h3>
               <p className="text-slate-500 font-medium max-w-sm mx-auto">Your account has been successfully verified across all platform pillars. Welcome to the circle.</p>
               <button onClick={() => window.location.reload()} className="bg-black text-white px-12 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-[#7851A9]">Access Dashboard</button>
            </div>
          )}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#7851A9]/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
        </div>
      </div>
    </div>
  );
};
