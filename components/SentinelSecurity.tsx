
import React, { useState, useEffect, useRef } from 'react';
import { BrandSubmark } from './BrandAssets';

interface ThreatLog {
  id: string;
  type: 'SQL_INJECTION' | 'XSS' | 'BRUTE_FORCE' | 'RANSOMWARE_HEURISTIC' | 'SYBIL_ATTEMPT';
  origin: string;
  timestamp: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'BLOCKED' | 'QUARANTINED';
}

export const SentinelSecurity: React.FC = () => {
  const [isDeepScanning, setIsDeepScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [threatLevel, setThreatLevel] = useState<'STABLE' | 'ELEVATED' | 'CRITICAL'>('STABLE');
  const [logs, setLogs] = useState<ThreatLog[]>([]);
  const [shieldActive, setShieldActive] = useState(true);
  const [activeTab, setActiveTab] = useState<'MONITOR' | 'INTEGRITY' | 'VAULT'>('MONITOR');

  const scanIntervalRef = useRef<number | null>(null);

  // Passive Monitoring Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.85) {
        const types: ThreatLog['type'][] = ['SQL_INJECTION', 'XSS', 'BRUTE_FORCE', 'SYBIL_ATTEMPT'];
        const newThreat: ThreatLog = {
          id: `TH-${Math.random().toString(36).substr(2, 9)}`,
          type: types[Math.floor(Math.random() * types.length)],
          origin: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.X.X`,
          timestamp: new Date().toLocaleTimeString(),
          severity: Math.random() > 0.8 ? 'HIGH' : 'MEDIUM',
          status: 'BLOCKED'
        };
        setLogs(prev => [newThreat, ...prev].slice(0, 10));
        if (newThreat.severity === 'HIGH') {
          setThreatLevel('ELEVATED');
          setTimeout(() => setThreatLevel('STABLE'), 5000);
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const runDeepScan = () => {
    setIsDeepScanning(true);
    setScanProgress(0);
    let progress = 0;
    
    scanIntervalRef.current = window.setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        setIsDeepScanning(false);
        if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
      }
      setScanProgress(progress);
    }, 800);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header HUD */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
          <div className={`p-5 rounded-3xl transition-all duration-500 shadow-2xl ${
            threatLevel === 'STABLE' ? 'bg-emerald-500 text-white' : 
            threatLevel === 'ELEVATED' ? 'bg-amber-500 text-white animate-pulse' : 
            'bg-red-500 text-white animate-bounce'
          }`}>
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h3 className="text-4xl font-black text-black tracking-tighter italic uppercase">Sentinel Security Aegis</h3>
            <p className="text-slate-500 font-medium mt-1 uppercase text-[10px] tracking-widest font-accent">
              Status: <span className={threatLevel === 'STABLE' ? 'text-emerald-500' : 'text-amber-500'}>{threatLevel}</span> | Network Shield: <span className="text-emerald-500">ACTIVE</span>
            </p>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-[2rem]">
          {(['MONITOR', 'INTEGRITY', 'VAULT'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab ? 'bg-white text-[#7851A9] shadow-sm' : 'text-slate-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Security Canvas */}
        <div className="lg:col-span-2 space-y-8">
          {activeTab === 'MONITOR' && (
            <div className="bg-slate-950 rounded-[4rem] p-12 text-white relative overflow-hidden shadow-2xl min-h-[500px]">
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-center mb-12">
                  <h4 className="text-xl font-black uppercase italic tracking-tighter">Real-time Threat Interception</h4>
                  <div className="flex gap-4">
                    <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <p className="text-[10px] font-black text-emerald-500 uppercase">Blocked Requests</p>
                      <p className="text-xl font-black tracking-tighter italic">12,842</p>
                    </div>
                    <div className="px-4 py-2 bg-[#7851A9]/10 border border-[#7851A9]/20 rounded-xl">
                      <p className="text-[10px] font-black text-[#7851A9] uppercase">Active Mitigation</p>
                      <p className="text-xl font-black tracking-tighter italic">24/7</p>
                    </div>
                  </div>
                </div>

                {/* Radar visualization */}
                <div className="flex-1 flex items-center justify-center relative py-20">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 border border-emerald-500/20 rounded-full animate-ping"></div>
                    <div className="w-48 h-48 border border-emerald-500/10 rounded-full absolute"></div>
                    <div className="w-32 h-32 border border-emerald-500/5 rounded-full absolute"></div>
                  </div>
                  <div className="relative">
                     <BrandSubmark size={120} color="#7851A9" variant="WHITE" showCrown={true} className="animate-pulse" />
                     <div className="absolute -top-4 -left-4 w-4 h-4 bg-red-500 rounded-full blur-[2px] animate-bounce"></div>
                     <div className="absolute bottom-10 -right-8 w-4 h-4 bg-amber-500 rounded-full blur-[2px] animate-pulse"></div>
                  </div>
                </div>

                <div className="mt-12 grid grid-cols-3 gap-6">
                   <SecurityStatusItem label="SSL Layer" value="Enabled" />
                   <SecurityStatusItem label="XSS Guard" value="Active" />
                   <SecurityStatusItem label="DDoS Shield" value="Engaged" />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(120,81,169,0.1),transparent_70%)]"></div>
            </div>
          )}

          {activeTab === 'INTEGRITY' && (
            <div className="bg-white rounded-[4rem] p-12 border border-[#CA9CE1]/20 shadow-sm space-y-12">
              <div className="max-w-xl">
                <h4 className="text-3xl font-black text-black tracking-tighter uppercase italic mb-4">24-Hour Intensive Data Audit</h4>
                <p className="text-slate-500 font-medium">Deep-cycle verification system designed to detect non-human tampering, ledger drift, or crypto-locking attempts (Ransomware defense).</p>
              </div>

              {!isDeepScanning && scanProgress < 100 && (
                <div className="bg-slate-50 p-12 rounded-[3rem] text-center space-y-8 border border-slate-100">
                  <div className="w-20 h-20 bg-[#7851A9] text-white rounded-full flex items-center justify-center mx-auto shadow-xl">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div className="space-y-4">
                    <h5 className="text-xl font-black">Initiate High-Intensity Scan</h5>
                    <p className="text-sm text-slate-400 max-w-sm mx-auto">This process audits every hash in the Good Circles ledger across the last 24 hours of settlement.</p>
                  </div>
                  <button 
                    onClick={runDeepScan}
                    className="bg-black text-white px-12 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] transition-all shadow-xl"
                  >
                    Deploy Deep Audit Engine
                  </button>
                </div>
              )}

              {(isDeepScanning || scanProgress === 100) && (
                <div className="space-y-10">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-black text-[#7851A9] uppercase tracking-widest font-accent mb-2">
                        {scanProgress < 100 ? 'Scanning Ledger Modules...' : 'Audit Cycle Complete'}
                      </p>
                      <h5 className="text-4xl font-black italic tracking-tighter">{Math.round(scanProgress)}% Verified</h5>
                    </div>
                    {scanProgress === 100 && (
                      <span className="px-6 py-2 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                        Zero Anomalies Detected
                      </span>
                    )}
                  </div>
                  
                  <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div 
                      className="h-full bg-[#7851A9] transition-all duration-300 ease-out shadow-[0_0_20px_rgba(120,81,169,0.5)]" 
                      style={{ width: `${scanProgress}%` }}
                    ></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AuditStep label="COGS Hash Verification" status={scanProgress > 20 ? 'COMPLETE' : 'PENDING'} />
                    <AuditStep label="Nonprofit Disbursement Logs" status={scanProgress > 45 ? 'COMPLETE' : 'PENDING'} />
                    <AuditStep label="Platform Fee Consistency" status={scanProgress > 70 ? 'COMPLETE' : 'PENDING'} />
                    <AuditStep label="Merchant Reserve Collateral" status={scanProgress > 95 ? 'COMPLETE' : 'PENDING'} />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'VAULT' && (
             <div className="bg-slate-50 rounded-[4rem] p-12 border border-slate-200 shadow-inner grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                   <h4 className="text-2xl font-black italic tracking-tighter uppercase">Encryption Vault</h4>
                   <p className="text-sm text-slate-500 leading-relaxed font-medium">All financial and personal data is wrapped in AES-256-GCM. Merchant Payout details are vaulted using asynchronous RSA keys rotating every 72 hours.</p>
                   <div className="p-6 bg-white rounded-3xl border border-slate-200">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Active Encryption Key ID</p>
                      <code className="text-xs font-mono text-[#7851A9] break-all">GC_SEC_K_9921_X009_L44_A1_FF823</code>
                   </div>
                </div>
                <div className="bg-white rounded-3xl p-8 border border-slate-200 space-y-6">
                   <h5 className="text-[10px] font-black uppercase tracking-widest">Security Credentials</h5>
                   <ul className="space-y-4">
                      <li className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-400">SOC2 Compliance</span>
                        <span className="text-emerald-500 font-black">VERIFIED</span>
                      </li>
                      <li className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-400">PCI-DSS Gateway</span>
                        <span className="text-emerald-500 font-black">ACTIVE</span>
                      </li>
                      <li className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-400">Biometric Verification</span>
                        <span className="text-[#7851A9] font-black">ENABLED</span>
                      </li>
                   </ul>
                </div>
             </div>
          )}
        </div>

        {/* Threat Log Sidebar */}
        <div className="space-y-8">
          <div className="bg-white rounded-[3rem] p-10 border border-[#CA9CE1]/20 shadow-sm min-h-[500px] flex flex-col">
            <h4 className="text-xl font-black uppercase italic tracking-tighter mb-8 border-b border-slate-100 pb-6">Passive Threat Log</h4>
            <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
              {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full opacity-20 py-10">
                  <svg className="w-12 h-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <p className="font-black text-[10px] uppercase">Monitoring Silence...</p>
                </div>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-[#7851A9]/20 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                        log.severity === 'HIGH' ? 'bg-red-100 text-red-500' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {log.severity} Threat
                      </span>
                      <span className="text-[10px] font-black text-slate-300">{log.timestamp}</span>
                    </div>
                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{log.type.replace('_', ' ')}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-[10px] font-mono text-slate-400">ORIGIN: {log.origin}</span>
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{log.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Node Latency</span>
               <span className="text-xs font-black italic">14ms</span>
            </div>
          </div>

          <div className="bg-[#A20021] text-white p-10 rounded-[3rem] shadow-xl space-y-6">
             <div className="flex items-center gap-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                <h5 className="text-xl font-black italic tracking-tighter uppercase">Ransomware Killswitch</h5>
             </div>
             <p className="text-xs opacity-80 font-medium leading-relaxed">In the event of a broad heuristic anomaly, the Platform Governance module can instantly isolate the Settlement Ledger from external APIs to prevent data encryption loops.</p>
             <button className="w-full bg-white text-[#A20021] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">Enable Auto-Killswitch</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SecurityStatusItem = ({ label, value }: { label: string, value: string }) => (
  <div className="text-center">
    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">{label}</p>
    <p className="text-sm font-black italic text-emerald-500">{value}</p>
  </div>
);

const AuditStep = ({ label, status }: { label: string, status: 'COMPLETE' | 'PENDING' }) => (
  <div className={`p-5 rounded-2xl border transition-all ${
    status === 'COMPLETE' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-slate-50 border-slate-100 text-slate-400'
  }`}>
    <div className="flex justify-between items-center">
      <span className="text-xs font-black uppercase tracking-tight">{label}</span>
      {status === 'COMPLETE' ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
      ) : (
        <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-400 rounded-full animate-spin"></div>
      )}
    </div>
  </div>
);
