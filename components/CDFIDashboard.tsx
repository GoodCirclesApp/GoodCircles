
import React, { useState, useEffect } from 'react';
import { useGoodCirclesStore } from '../hooks/useGoodCirclesStore';
import { BrandSubmark } from './BrandAssets';

interface Application {
  id: string;
  amount: number;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'DENIED';
  recipientMerchant: {
    orgName: string;
    category: string;
  };
  fund: {
    name: string;
  };
}

interface Evaluation {
  riskScore: number;
  impactScore: number;
  recommendation: string;
  suggestedInterestRate: number;
  suggestedTermMonths: number;
  analysis: string;
  communityBenefits: string[];
  riskFactors: string[];
}

export const CDFIDashboard: React.FC = () => {
  const { currentUser } = useGoodCirclesStore();
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  useEffect(() => {
    if (currentUser?.cdfiId) {
      fetchApplications();
    }
  }, [currentUser]);

  const fetchApplications = async () => {
    try {
      const res = await fetch(`/api/cdfi/${currentUser?.cdfiId}/applications`);
      const data = await res.json();
      setApplications(data);
    } catch (err) {
      console.error("Failed to fetch applications", err);
    }
  };

  const handleEvaluate = async (app: Application) => {
    setSelectedApp(app);
    setEvaluation(null);
    setIsEvaluating(true);
    try {
      const res = await fetch(`/api/cdfi/applications/${app.id}/evaluate`, { method: 'POST' });
      const data = await res.json();
      setEvaluation(data);
    } catch (err) {
      console.error("Evaluation failed", err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleAction = async (action: 'approve' | 'deny') => {
    if (!selectedApp || !currentUser?.cdfiId) return;
    try {
      await fetch(`/api/cdfi/${currentUser.cdfiId}/applications/${selectedApp.id}/${action}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: action === 'approve' ? JSON.stringify({ interestRate: evaluation?.suggestedInterestRate || 5, termMonths: evaluation?.suggestedTermMonths || 12 }) : undefined
      });
      fetchApplications();
      setSelectedApp(null);
      setEvaluation(null);
    } catch (err) {
      console.error(`Action ${action} failed`, err);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-none">CDFI Partner Portal.</h2>
          <p className="text-slate-400 font-medium mt-4 uppercase tracking-widest text-[10px]">Capital Deployment & Impact Underwriting</p>
        </div>
        <div className="flex gap-4">
          <div className="p-6 bg-white border border-slate-200 rounded-[2rem] text-center min-w-[160px]">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Applications</p>
            <p className="text-2xl font-black text-black italic">{applications.filter(a => a.status === 'PENDING').length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Applications List */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 ml-4">Pending Requests</h3>
          <div className="space-y-4">
            {applications.filter(a => a.status === 'PENDING').map(app => (
              <button
                key={app.id}
                onClick={() => handleEvaluate(app)}
                className={`w-full p-8 rounded-[2.5rem] border-2 text-left transition-all ${
                  selectedApp?.id === app.id ? 'bg-black border-black text-white shadow-2xl scale-[1.02]' : 'bg-white border-slate-100 hover:border-[#7851A9]/30'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{app.fund.name}</p>
                  <p className="text-lg font-black italic">${app.amount.toLocaleString()}</p>
                </div>
                <h4 className="text-xl font-black uppercase italic tracking-tighter leading-tight mb-2">{app.recipientMerchant.orgName}</h4>
                <p className={`text-xs font-medium line-clamp-2 ${selectedApp?.id === app.id ? 'text-slate-300' : 'text-slate-500'}`}>
                  {app.description}
                </p>
              </button>
            ))}
            {applications.filter(a => a.status === 'PENDING').length === 0 && (
              <div className="p-12 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                <p className="text-slate-400 font-bold italic">No pending applications.</p>
              </div>
            )}
          </div>
        </div>

        {/* Evaluation Panel */}
        <div className="lg:col-span-2">
          {selectedApp ? (
            <div className="bg-white border border-slate-200 rounded-[4rem] p-12 shadow-sm space-y-10 min-h-[600px] flex flex-col">
              <div className="flex justify-between items-start">
                <div className="flex gap-6 items-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-[2.5rem] flex items-center justify-center">
                    <BrandSubmark size={40} color="#7851A9" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-none">{selectedApp.recipientMerchant.orgName}</h3>
                    <p className="text-slate-400 text-xs font-medium mt-2">Loan Request: <span className="text-black font-black">${selectedApp.amount.toLocaleString()}</span></p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => handleAction('deny')} className="px-8 py-4 bg-red-50 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Deny</button>
                  <button onClick={() => handleAction('approve')} className="px-8 py-4 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all">Approve</button>
                </div>
              </div>

              <div className="flex-1">
                {isEvaluating ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-6">
                    <div className="w-16 h-16 border-4 border-[#7851A9]/20 border-t-[#7851A9] rounded-full animate-spin"></div>
                    <p className="text-sm font-black uppercase tracking-widest text-slate-400 animate-pulse">AI Underwriting in Progress...</p>
                  </div>
                ) : evaluation ? (
                  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <ScoreCard label="Risk Score" value={evaluation.riskScore} max={10} color={evaluation.riskScore > 7 ? 'red' : evaluation.riskScore > 4 ? 'amber' : 'emerald'} />
                      <ScoreCard label="Impact Score" value={evaluation.impactScore} max={10} color="emerald" />
                      <StatCard label="Suggested Rate" value={`${evaluation.suggestedInterestRate}%`} />
                      <StatCard label="Suggested Term" value={`${evaluation.suggestedTermMonths} Mo`} />
                    </div>

                    <div className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-[#7851A9] mb-4">AI Strategic Analysis</h4>
                      <p className="text-sm text-slate-700 leading-relaxed font-medium italic">"{evaluation.analysis}"</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Community Benefits</h4>
                        <ul className="space-y-2">
                          {evaluation.communityBenefits.map((b, i) => (
                            <li key={i} className="flex items-center gap-3 text-xs font-bold text-slate-600">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-red-500">Risk Factors</h4>
                        <ul className="space-y-2">
                          {evaluation.riskFactors.map((r, i) => (
                            <li key={i} className="flex items-center gap-3 text-xs font-bold text-slate-600">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <p className="text-xl font-black italic uppercase tracking-tighter">Ready for Underwriting</p>
                      <p className="text-slate-400 text-xs font-medium mt-2">Select an application to begin AI-powered risk assessment.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[600px] border-4 border-dashed border-slate-100 rounded-[4rem] flex flex-col items-center justify-center text-center space-y-6">
               <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
               </div>
               <div>
                  <p className="text-2xl font-black italic uppercase tracking-tighter">Underwriting Queue</p>
                  <p className="text-slate-400 text-sm font-medium mt-2">Select a pending application from the left to review details and run AI analysis.</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ScoreCard = ({ label, value, max, color }: { label: string, value: number, max: number, color: 'emerald' | 'amber' | 'red' }) => (
  <div className="p-6 bg-white border border-slate-100 rounded-3xl text-center shadow-sm">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{label}</p>
    <div className="relative inline-flex items-center justify-center">
      <svg className="w-16 h-16 transform -rotate-90">
        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100" />
        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" 
          strokeDasharray={175.9} 
          strokeDashoffset={175.9 - (175.9 * value) / max}
          className={color === 'emerald' ? 'text-emerald-500' : color === 'amber' ? 'text-amber-500' : 'text-red-500'} 
        />
      </svg>
      <span className="absolute text-lg font-black italic">{value}</span>
    </div>
  </div>
);

const StatCard = ({ label, value }: { label: string, value: string }) => (
  <div className="p-6 bg-white border border-slate-100 rounded-3xl text-center shadow-sm flex flex-col justify-center">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
    <p className="text-2xl font-black text-black italic">{value}</p>
  </div>
);
