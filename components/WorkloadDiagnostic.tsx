
import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface WorkloadStats {
  throughput: number; 
  concurrency: number;
  totalOrders: number;
  latency: number;
  cpuOverhead: number;
}

export const WorkloadDiagnostic: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [optimizationsEnabled, setOptimizationsEnabled] = useState(false);
  const [data, setData] = useState<WorkloadStats[]>([]);
  const [currentLoad, setCurrentLoad] = useState(0);
  const [failureReport, setFailureReport] = useState<{
    totalVolume: number;
    simultaneous: number;
    overhead: string;
    error: string;
    location: string;
    remediation: string;
  } | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  
  const timerRef = useRef<number | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-15), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const simulateOrderBatch = async (count: number) => {
    const startTime = performance.now();
    
    // System limits
    const saturationCeiling = optimizationsEnabled ? 520 : 140;
    const cpuBase = optimizationsEnabled ? 15 : 42;

    try {
      // Simulation of work
      await Promise.all(
        Array.from({ length: count }).map(async (_, i) => {
          // Failure Logic
          if (count > saturationCeiling && Math.random() > 0.7) {
            const errType = optimizationsEnabled 
              ? "Node.js Event Loop Saturation (V8 Heap Limit)" 
              : "Critical Buffer Overflow: Database Transaction Lock";
            throw new Error(errType);
          }
          
          // Simulated latency (Optimized is faster due to batching overhead reduction)
          const processingDelay = optimizationsEnabled ? 20 : 100;
          await new Promise(r => setTimeout(r, Math.random() * processingDelay));
          return true;
        })
      );

      const endTime = performance.now();
      const latency = endTime - startTime;

      const newStat = {
        throughput: count,
        concurrency: count,
        totalOrders: (data[data.length - 1]?.totalOrders || 0) + count,
        latency: Math.round(latency),
        cpuOverhead: Math.min(99, cpuBase + (count / (saturationCeiling/40)))
      };

      setData(prev => [...prev, newStat]);
      setCurrentLoad(count);
      
      if (count % 50 === 0) {
        addLog(`${optimizationsEnabled ? 'BATCHED' : 'SYNC'} Load: ${count} ops/sec | Latency: ${newStat.latency}ms`);
      }
      
      return true;
    } catch (err: any) {
      setIsRunning(false);
      setFailureReport({
        totalVolume: (data[data.length - 1]?.totalOrders || 0) + count,
        simultaneous: count,
        overhead: optimizationsEnabled 
          ? "I/O Wait: 12% | CPU: 98% | Memory: 1.2GB/1.5GB"
          : "Database Locks: 88% | CPU: 42% | Idle Waiting: 58%",
        error: err.message,
        location: optimizationsEnabled ? "Runtime Environment (Infrastructure Limit)" : "App.tsx -> checkout() -> Ledger Write",
        remediation: optimizationsEnabled 
          ? "Scaling required: Vertical upgrade to 8-core CPU or Horizontal Load Balancing."
          : "Architectural patch required: Implement Redis-backed Queue & Batch Settlement."
      });
      addLog(`SYSTEM CRASH: ${err.message}`);
      return false;
    }
  };

  const startTest = () => {
    setIsRunning(true);
    setFailureReport(null);
    setData([]);
    setLogs([`Initialising ${optimizationsEnabled ? 'OPTIMIZED' : 'LEGACY'} stress test...`]);
    
    let scale = 10;
    const runLoop = async () => {
      const success = await simulateOrderBatch(scale);
      if (success) {
        scale += optimizationsEnabled ? 30 : 10; 
        timerRef.current = window.setTimeout(runLoop, 1000);
      }
    };
    runLoop();
  };

  const stopTest = () => {
    setIsRunning(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  return (
    <div className="space-y-10 animate-in fade-in zoom-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-4xl font-black text-black tracking-tighter italic uppercase">Workload Diagnostic v2.0</h3>
          <p className="text-slate-500 font-medium mt-2">Stress testing the Good Circles settlement engine.</p>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button 
              onClick={() => setOptimizationsEnabled(false)}
              disabled={isRunning}
              className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${!optimizationsEnabled ? 'bg-white text-[#A20021] shadow-sm' : 'text-slate-400 opacity-50'}`}
            >
              Legacy Sync
            </button>
            <button 
              onClick={() => setOptimizationsEnabled(true)}
              disabled={isRunning}
              className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${optimizationsEnabled ? 'bg-[#7851A9] text-white shadow-sm' : 'text-slate-400'}`}
            >
              Async Batching
            </button>
          </div>

          {!isRunning ? (
            <button 
              onClick={startTest}
              className="bg-black text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] transition-all shadow-xl active:scale-95"
            >
              Start Probe
            </button>
          ) : (
            <button 
              onClick={stopTest}
              className="bg-red-500 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl animate-pulse"
            >
              Kill Process
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Visualization */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-[#CA9CE1]/20 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h4 className="text-xl font-black uppercase italic tracking-tighter">Saturation Curve</h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Throughput vs System Overhead</p>
            </div>
            {isRunning && (
               <div className="flex gap-4">
                  <div className="text-right">
                    <p className="text-[8px] font-black text-slate-400 uppercase">Load</p>
                    <p className="text-xl font-black italic">{currentLoad} ops/s</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black text-slate-400 uppercase">CPU</p>
                    <p className="text-xl font-black italic text-[#A20021]">{Math.round(data[data.length-1]?.cpuOverhead || 0)}%</p>
                  </div>
               </div>
            )}
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorThroughput" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7851A9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#7851A9" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A20021" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#A20021" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#CA9CE120" />
                <XAxis dataKey="throughput" hide />
                <YAxis tick={{fontSize: 9, fontWeight: 900, fill: '#94a3b8'}} />
                <Tooltip 
                   contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '20px' }}
                />
                <Area type="monotone" dataKey="throughput" stroke="#7851A9" fillOpacity={1} fill="url(#colorThroughput)" strokeWidth={4} name="Ops/Sec" />
                <Area type="monotone" dataKey="latency" stroke="#A20021" fillOpacity={1} fill="url(#colorLatency)" strokeWidth={2} name="Latency (ms)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 flex justify-center gap-10">
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#7851A9]"></div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Transaction Volume</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#A20021]"></div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Processing Latency</span>
             </div>
          </div>
        </div>

        {/* Live Terminal */}
        <div className="bg-slate-950 text-[#CA9CE1] p-8 rounded-[3rem] font-mono text-[10px] flex flex-col h-[450px] shadow-2xl border border-white/5">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500 animate-ping' : 'bg-red-500'}`}></div>
              <span className="uppercase tracking-widest font-black text-white">Kernel Logs</span>
            </div>
            <span className="text-white/20">GC-OS v2.4</span>
          </div>
          <div ref={logRef} className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2 leading-relaxed">
            {logs.map((log, i) => (
              <div key={i} className="flex gap-4">
                <span className="text-white/20 shrink-0">{(i+1).toString().padStart(3, '0')}</span>
                <span className="opacity-80 break-words">{log}</span>
              </div>
            ))}
            {isRunning && <div className="animate-pulse text-white">█</div>}
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between opacity-40 italic">
            <span>Buffer: {Math.min(100, Math.round((currentLoad/520)*100))}%</span>
            <span>Thread: Worker-01</span>
          </div>
        </div>
      </div>

      {/* Enhanced Failure Post-Mortem */}
      {failureReport && (
        <section className="bg-white border-2 border-[#A20021] rounded-[4rem] p-12 md:p-20 shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-10">
          <div className="relative z-10 grid grid-cols-1 xl:grid-cols-3 gap-16">
            <div className="xl:col-span-2 space-y-12">
              <div className="flex items-center gap-6">
                <div className="bg-[#A20021] text-white p-5 rounded-2xl shadow-xl">
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                </div>
                <div>
                  <h3 className="text-5xl font-black text-black tracking-tighter uppercase italic">Crash Report</h3>
                  <p className="text-[#A20021] font-black text-[10px] uppercase tracking-[0.4em] mt-2">Saturation Bottleneck Identified</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-accent">Primary Exception</p>
                  <p className="text-2xl font-black text-[#A20021] italic leading-tight">{failureReport.error}</p>
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-accent">Failure Coordinate</p>
                  <p className="text-lg font-bold text-slate-900">{failureReport.location}</p>
                </div>
              </div>

              <div className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100">
                <p className="text-[10px] font-black text-[#7851A9] uppercase tracking-widest mb-4 font-accent">Recommended Remediation</p>
                <p className="text-xl font-medium text-slate-700 leading-relaxed italic">"{failureReport.remediation}"</p>
              </div>
            </div>

            <div className="bg-slate-900 text-white rounded-[3rem] p-10 flex flex-col justify-between">
              <div className="space-y-10">
                <ReportMetric label="Peak Volume" value={failureReport.simultaneous} unit="Ops/Sec" />
                <ReportMetric label="Total Processed" value={failureReport.totalVolume} unit="Transactions" />
                <ReportMetric label="System Overhead" value={failureReport.overhead} isText />
              </div>
              <button 
                onClick={startTest}
                className="w-full bg-white text-black py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7851A9] hover:text-white transition-all mt-10"
              >
                Re-Run Active Probe
              </button>
            </div>
          </div>
          {/* Decorative element */}
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#A20021]/5 rounded-full blur-[100px]"></div>
        </section>
      )}
    </div>
  );
};

const ReportMetric = ({ label, value, unit = "", isText = false }: { label: string, value: string | number, unit?: string, isText?: boolean }) => (
  <div className="space-y-2">
    <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">{label}</p>
    <p className={`${isText ? 'text-sm' : 'text-3xl'} font-black italic text-white leading-tight`}>
      {value} <span className="text-xs opacity-40 font-normal">{unit}</span>
    </p>
  </div>
);
