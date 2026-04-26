
import React, { useState, useEffect, useCallback } from 'react';
import { useGoodCirclesStore } from '../hooks/useGoodCirclesStore';
import { BrandSubmark } from './BrandAssets';

// ── Types ────────────────────────────────────────────────────────────────────

interface Application {
  id: string;
  amount: number;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'DENIED';
  recipientMerchant: { orgName: string; category: string };
  fund: { name: string };
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

interface MerchantPackage {
  id: string;
  status: 'PENDING' | 'REVIEWED' | 'CONVERTED' | 'DECLINED';
  packageStatus: string;
  merchant: {
    id: string;
    businessName: string;
    censusTractId?: string;
    isQualifiedInvestmentArea?: boolean;
  };
  totalTransactionVolume?: number;
  createdAt: string;
}

interface CdfiSettings {
  targetCensusTracts: string[];
  milestoneThreshold: number;
  reportingFrequency: string;
  tlrColumnMapping: Record<string, string> | null;
}

// ── Demo data ─────────────────────────────────────────────────────────────────

const DEMO_APPLICATIONS: Application[] = [
  {
    id: 'demo-app-001',
    amount: 25000,
    description: 'Expansion of cold storage capacity to support a 40% increase in weekly CSA box production. Will allow onboarding of 3 additional farm partners and serve 200 new neighborhood households.',
    status: 'PENDING',
    recipientMerchant: { orgName: 'Jackson Fresh Market Co-op', category: 'GROCERIES' },
    fund: { name: 'Mississippi Community Capital Fund' },
  },
  {
    id: 'demo-app-002',
    amount: 12500,
    description: 'Purchase of 2 electric cargo bikes and charging infrastructure to launch zero-emission same-day delivery service within a 5-mile radius of downtown Jackson.',
    status: 'PENDING',
    recipientMerchant: { orgName: 'Eastside Transportation Co.', category: 'TRANSPORTATION' },
    fund: { name: 'Green Infrastructure Initiative' },
  },
  {
    id: 'demo-app-003',
    amount: 8000,
    description: 'Commercial kitchen equipment upgrade to enable catering services and double weekly meal production capacity for the community lunch program.',
    status: 'PENDING',
    recipientMerchant: { orgName: 'Sunset Bakery & Café', category: 'DINING' },
    fund: { name: 'Small Business Resilience Fund' },
  },
];

const DEMO_EVALUATION: Evaluation = {
  riskScore: 3,
  impactScore: 9,
  recommendation: 'APPROVE',
  suggestedInterestRate: 4.5,
  suggestedTermMonths: 36,
  analysis: 'This application presents a compelling community impact case with manageable risk. The merchant has demonstrated 18 months of consistent platform participation with a 94% positive transaction record. The requested capital is directly tied to capacity expansion with a clear revenue model. Debt service coverage ratio is estimated at 1.8x based on projected volume.',
  communityBenefits: [
    'Creates 2 new full-time equivalent jobs in the community',
    'Increases food access for 200 additional households',
    'Generates an estimated $8,400/year in additional nonprofit donations',
    'Supports 3 additional local farm partners joining the network',
  ],
  riskFactors: [
    'Seasonal revenue variation (peak summer, slower winter)',
    'Cold storage equipment has 10-year useful life — monitor maintenance reserves',
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('gc_auth_token');
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

type Tab = 'applications' | 'packages' | 'settings';

// ── Main component ────────────────────────────────────────────────────────────

export const CDFIDashboard: React.FC = () => {
  const { currentUser } = useGoodCirclesStore();
  const cdfiId = currentUser?.cdfiId;
  const isDemo = !cdfiId;

  const [tab, setTab] = useState<Tab>('applications');

  // Loan applications state
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Packages state
  const [packages, setPackages] = useState<MerchantPackage[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [updatingPkg, setUpdatingPkg] = useState<string | null>(null);

  // Settings state
  const [settings, setSettings] = useState<CdfiSettings>({
    targetCensusTracts: [],
    milestoneThreshold: 50,
    reportingFrequency: 'QUARTERLY',
    tlrColumnMapping: null,
  });
  const [settingsInput, setSettingsInput] = useState({
    targetCensusTracts: '',
    milestoneThreshold: '50',
    reportingFrequency: 'QUARTERLY',
    tlrColumnMapping: '',
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState('');
  const [tlrExporting, setTlrExporting] = useState(false);

  // ── Data fetching ─────────────────────────────────────────────────────────

  const fetchApplications = useCallback(async () => {
    if (!cdfiId) { setApplications(DEMO_APPLICATIONS); return; }
    try {
      const res = await fetch(`/api/cdfi/${cdfiId}/applications`, { headers: authHeaders() });
      const data = await res.json();
      setApplications(Array.isArray(data) && data.length > 0 ? data : DEMO_APPLICATIONS);
    } catch {
      setApplications(DEMO_APPLICATIONS);
    }
  }, [cdfiId]);

  const fetchPackages = useCallback(async () => {
    if (!cdfiId) return;
    setPackagesLoading(true);
    try {
      const res = await fetch(`/api/cdfi/${cdfiId}/packages`, { headers: authHeaders() });
      const data = await res.json();
      setPackages(Array.isArray(data) ? data : []);
    } catch {
      setPackages([]);
    } finally {
      setPackagesLoading(false);
    }
  }, [cdfiId]);

  const fetchSettings = useCallback(async () => {
    if (!cdfiId) return;
    try {
      const res = await fetch(`/api/cdfi/${cdfiId}/dashboard`, { headers: authHeaders() });
      const data = await res.json();
      if (data?.targetCensusTracts !== undefined) {
        const s: CdfiSettings = {
          targetCensusTracts: data.targetCensusTracts ?? [],
          milestoneThreshold: data.milestoneThreshold ?? 5000,
          reportingFrequency: data.reportingFrequency ?? 'QUARTERLY',
          tlrColumnMapping: data.tlrColumnMapping ?? null,
        };
        setSettings(s);
        setSettingsInput({
          targetCensusTracts: (s.targetCensusTracts ?? []).join(', '),
          milestoneThreshold: String(s.milestoneThreshold),
          reportingFrequency: s.reportingFrequency,
          tlrColumnMapping: s.tlrColumnMapping ? JSON.stringify(s.tlrColumnMapping, null, 2) : '',
        });
      }
    } catch { /* use defaults */ }
  }, [cdfiId]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  useEffect(() => {
    if (tab === 'packages') fetchPackages();
    if (tab === 'settings') fetchSettings();
  }, [tab, fetchPackages, fetchSettings]);

  // ── Loan applications logic ───────────────────────────────────────────────

  const handleEvaluate = async (app: Application) => {
    setSelectedApp(app);
    setEvaluation(null);
    setIsEvaluating(true);
    if (isDemo || app.id.startsWith('demo-')) {
      setTimeout(() => { setEvaluation(DEMO_EVALUATION); setIsEvaluating(false); }, 1800);
      return;
    }
    try {
      const res = await fetch(`/api/cdfi/applications/${app.id}/evaluate`, {
        method: 'POST',
        headers: authHeaders(),
      });
      setEvaluation(await res.json());
    } catch {
      setEvaluation(DEMO_EVALUATION);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleAction = async (action: 'approve' | 'deny') => {
    if (!selectedApp || !cdfiId) return;
    try {
      await fetch(`/api/cdfi/${cdfiId}/applications/${selectedApp.id}/${action}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: action === 'approve'
          ? JSON.stringify({ interestRate: evaluation?.suggestedInterestRate ?? 5, termMonths: evaluation?.suggestedTermMonths ?? 12 })
          : JSON.stringify({}),
      });
      fetchApplications();
      setSelectedApp(null);
      setEvaluation(null);
    } catch (err) {
      console.error(`Action ${action} failed`, err);
    }
  };

  // ── Packages logic ───────────────────────────────────────────────────────

  const updatePackageStatus = async (pkgId: string, status: 'REVIEWED' | 'CONVERTED' | 'DECLINED') => {
    if (!cdfiId) return;
    setUpdatingPkg(pkgId);
    try {
      await fetch(`/api/cdfi/${cdfiId}/packages/${pkgId}/status`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ status }),
      });
      fetchPackages();
    } catch (err) {
      console.error('Package update failed', err);
    } finally {
      setUpdatingPkg(null);
    }
  };

  const handleTlrExport = async () => {
    if (!cdfiId) return;
    setTlrExporting(true);
    try {
      const year = new Date().getFullYear() - 1;
      const res = await fetch(`/api/cdfi/${cdfiId}/tlr-export?year=${year}`, { headers: authHeaders() });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tlr-${cdfiId}-${year}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('TLR export failed', err);
    } finally {
      setTlrExporting(false);
    }
  };

  // ── Settings logic ───────────────────────────────────────────────────────

  const saveSettings = async () => {
    if (!cdfiId) return;
    setSettingsSaving(true);
    setSettingsMsg('');
    try {
      let tlrColumnMapping: Record<string, string> | undefined;
      if (settingsInput.tlrColumnMapping.trim()) {
        try { tlrColumnMapping = JSON.parse(settingsInput.tlrColumnMapping); }
        catch { setSettingsMsg('TLR column mapping must be valid JSON.'); setSettingsSaving(false); return; }
      }
      const body: Record<string, any> = {
        targetCensusTracts: settingsInput.targetCensusTracts.split(',').map(s => s.trim()).filter(Boolean),
        milestoneThreshold: Number(settingsInput.milestoneThreshold) || 50,
        reportingFrequency: settingsInput.reportingFrequency,
      };
      if (tlrColumnMapping !== undefined) body.tlrColumnMapping = tlrColumnMapping;

      const res = await fetch(`/api/cdfi/${cdfiId}/settings`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Save failed');
      setSettingsMsg('Settings saved.');
    } catch (err: any) {
      setSettingsMsg(err.message ?? 'Error saving settings.');
    } finally {
      setSettingsSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {isDemo && (
        <div className="flex items-center gap-3 px-5 py-3 bg-amber-50 border border-amber-200 rounded-2xl w-fit">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Demo Mode — Sample data loaded. Register as CDFI to connect live data.</p>
        </div>
      )}

      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-none">CDFI Partner Portal.</h2>
          <p className="text-slate-400 font-medium mt-4 uppercase tracking-widest text-[10px]">Capital Deployment & Impact Underwriting</p>
        </div>
        <div className="flex gap-4">
          <div className="p-6 bg-white border border-slate-200 rounded-[2rem] text-center min-w-[140px]">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Applications</p>
            <p className="text-2xl font-black text-black italic">{applications.filter(a => a.status === 'PENDING').length}</p>
          </div>
          <div className="p-6 bg-white border border-slate-200 rounded-[2rem] text-center min-w-[140px]">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Merchant Packages</p>
            <p className="text-2xl font-black text-black italic">{packages.filter(p => p.status === 'PENDING').length}</p>
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex gap-2 border-b border-slate-100 pb-0">
        {(['applications', 'packages', 'settings'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-t-2xl transition-all ${
              tab === t
                ? 'bg-black text-white'
                : 'text-slate-400 hover:text-black hover:bg-slate-50'
            }`}
          >
            {t === 'applications' ? 'Loan Applications' : t === 'packages' ? 'Merchant Packages' : 'Settings'}
          </button>
        ))}
      </div>

      {/* ── Tab: Loan Applications ── */}
      {tab === 'applications' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 ml-4">Pending Requests</h3>
            <div className="space-y-4">
              {applications.filter(a => a.status === 'PENDING').map(app => (
                <button
                  key={app.id}
                  onClick={() => handleEvaluate(app)}
                  className={`w-full p-8 rounded-[2.5rem] border-2 text-left transition-all ${
                    selectedApp?.id === app.id
                      ? 'bg-black border-black text-white shadow-2xl scale-[1.02]'
                      : 'bg-white border-slate-100 hover:border-[#7851A9]/30'
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
                      <div className="w-16 h-16 border-4 border-[#7851A9]/20 border-t-[#7851A9] rounded-full animate-spin" />
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
      )}

      {/* ── Tab: Merchant Packages ── */}
      {tab === 'packages' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Auto-Matched Merchants in Target Census Tracts</h3>
            <button
              onClick={handleTlrExport}
              disabled={isDemo || tlrExporting}
              className="px-6 py-3 bg-[#7851A9] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#6340A0] transition-all disabled:opacity-40"
            >
              {tlrExporting ? 'Exporting…' : `Download TLR CSV (${new Date().getFullYear() - 1})`}
            </button>
          </div>

          {isDemo ? (
            <div className="p-12 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem]">
              <p className="text-slate-400 font-bold italic">Connect a live CDFI account to view merchant packages.</p>
            </div>
          ) : packagesLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-[#7851A9]/20 border-t-[#7851A9] rounded-full animate-spin" />
            </div>
          ) : packages.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem]">
              <p className="text-slate-400 font-bold italic">No merchant packages yet. Packages are auto-created when merchants in your target census tracts reach the transaction milestone threshold.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {packages.map(pkg => (
                <div key={pkg.id} className="bg-white border border-slate-100 rounded-[2rem] p-8 flex items-center justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-lg font-black uppercase italic tracking-tighter">{pkg.merchant.businessName}</h4>
                      {pkg.merchant.isQualifiedInvestmentArea && (
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest">LMI Area</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-medium">
                      Tract: {pkg.merchant.censusTractId ?? 'Pending geocode'} &nbsp;·&nbsp;
                      Matched {new Date(pkg.createdAt).toLocaleDateString()}
                    </p>
                    {pkg.totalTransactionVolume !== undefined && (
                      <p className="text-xs font-bold text-slate-600 mt-1">Volume: ${pkg.totalTransactionVolume.toLocaleString()}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <PkgStatusBadge status={pkg.status} />
                    {pkg.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => updatePackageStatus(pkg.id, 'REVIEWED')}
                          disabled={updatingPkg === pkg.id}
                          className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all disabled:opacity-40"
                        >Review</button>
                        <button
                          onClick={() => updatePackageStatus(pkg.id, 'CONVERTED')}
                          disabled={updatingPkg === pkg.id}
                          className="px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-40"
                        >Convert</button>
                        <button
                          onClick={() => updatePackageStatus(pkg.id, 'DECLINED')}
                          disabled={updatingPkg === pkg.id}
                          className="px-5 py-2.5 bg-red-50 text-red-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all disabled:opacity-40"
                        >Decline</button>
                      </>
                    )}
                    {pkg.status === 'REVIEWED' && (
                      <>
                        <button
                          onClick={() => updatePackageStatus(pkg.id, 'CONVERTED')}
                          disabled={updatingPkg === pkg.id}
                          className="px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-40"
                        >Convert</button>
                        <button
                          onClick={() => updatePackageStatus(pkg.id, 'DECLINED')}
                          disabled={updatingPkg === pkg.id}
                          className="px-5 py-2.5 bg-red-50 text-red-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all disabled:opacity-40"
                        >Decline</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Settings ── */}
      {tab === 'settings' && (
        <div className="max-w-2xl space-y-8">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">CDFI Configuration</h3>

          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 space-y-8">
            <SettingsField
              label="Target Census Tracts"
              hint="Comma-separated FIPS tract codes (e.g. 28049000100, 28049000200)"
            >
              <textarea
                rows={3}
                value={settingsInput.targetCensusTracts}
                onChange={e => setSettingsInput(s => ({ ...s, targetCensusTracts: e.target.value }))}
                disabled={isDemo}
                placeholder="28049000100, 28049000200"
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-[#7851A9] disabled:bg-slate-50 disabled:text-slate-400 resize-none"
              />
            </SettingsField>

            <SettingsField
              label="Merchant Milestone Threshold (transactions)"
              hint="Number of completed transactions before a merchant is auto-packaged for CDFI review (e.g. 50)"
            >
              <input
                type="number"
                value={settingsInput.milestoneThreshold}
                onChange={e => setSettingsInput(s => ({ ...s, milestoneThreshold: e.target.value }))}
                disabled={isDemo}
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-[#7851A9] disabled:bg-slate-50 disabled:text-slate-400"
              />
            </SettingsField>

            <SettingsField label="Reporting Frequency" hint="TLR reporting cadence for compliance submissions">
              <select
                value={settingsInput.reportingFrequency}
                onChange={e => setSettingsInput(s => ({ ...s, reportingFrequency: e.target.value }))}
                disabled={isDemo}
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-[#7851A9] disabled:bg-slate-50 disabled:text-slate-400 bg-white"
              >
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="ANNUALLY">Annually</option>
              </select>
            </SettingsField>

            <SettingsField
              label="TLR Column Mapping (JSON)"
              hint="Optional. Maps GoodCircles fields to your CDFI's TLR column headers. E.g. {&quot;merchantId&quot;: &quot;Borrower_ID&quot;}"
            >
              <textarea
                rows={5}
                value={settingsInput.tlrColumnMapping}
                onChange={e => setSettingsInput(s => ({ ...s, tlrColumnMapping: e.target.value }))}
                disabled={isDemo}
                placeholder='{"merchantId": "Borrower_ID", "saleAmount": "Loan_Amount"}'
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-mono focus:outline-none focus:border-[#7851A9] disabled:bg-slate-50 disabled:text-slate-400 resize-none"
              />
            </SettingsField>

            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={saveSettings}
                disabled={isDemo || settingsSaving}
                className="px-8 py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] transition-all disabled:opacity-40"
              >
                {settingsSaving ? 'Saving…' : 'Save Settings'}
              </button>
              {settingsMsg && (
                <p className={`text-xs font-bold ${settingsMsg.includes('aved') ? 'text-emerald-600' : 'text-red-500'}`}>
                  {settingsMsg}
                </p>
              )}
            </div>
          </div>

          {isDemo && (
            <p className="text-xs text-slate-400 font-medium italic">Settings are read-only in demo mode. Register a CDFI account to configure.</p>
          )}
        </div>
      )}
    </div>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

const ScoreCard = ({ label, value, max, color }: { label: string; value: number; max: number; color: 'emerald' | 'amber' | 'red' }) => (
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

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <div className="p-6 bg-white border border-slate-100 rounded-3xl text-center shadow-sm flex flex-col justify-center">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
    <p className="text-2xl font-black text-black italic">{value}</p>
  </div>
);

const PKG_STATUS_STYLES: Record<string, string> = {
  PENDING:  'bg-amber-50 text-amber-700',
  REVIEWED: 'bg-blue-50 text-blue-700',
  CONVERTED:'bg-emerald-50 text-emerald-700',
  DECLINED: 'bg-red-50 text-red-500',
};

const PkgStatusBadge = ({ status }: { status: string }) => (
  <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${PKG_STATUS_STYLES[status] ?? 'bg-slate-100 text-slate-500'}`}>
    {status}
  </span>
);

const SettingsField = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</label>
    {hint && <p className="text-xs text-slate-400 font-medium">{hint}</p>}
    {children}
  </div>
);
