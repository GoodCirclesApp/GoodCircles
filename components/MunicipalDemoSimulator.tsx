
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { motion } from 'framer-motion';
import { 
  Play, Pause, RotateCcw, TrendingUp, Users, DollarSign, Heart, Building2, 
  MapPin, Zap, ArrowUpRight, ChevronDown, ChevronUp, Presentation, Globe, Target
} from 'lucide-react';

interface ScalePreset {
  name: string;
  category: 'local' | 'regional' | 'national' | 'global';
  population: number;
  adoptionRate: number;
  avgTransaction: number;
  transactionsPerMonth: number;
  merchantParticipation: number;
  description: string;
}

const SCALE_PRESETS: ScalePreset[] = [
  { name: 'Small Town', category: 'local', population: 5000, adoptionRate: 8, avgTransaction: 35, transactionsPerMonth: 5, merchantParticipation: 15, description: '5K pop, early adopters' },
  { name: 'Small City', category: 'local', population: 25000, adoptionRate: 10, avgTransaction: 40, transactionsPerMonth: 6, merchantParticipation: 15, description: '25K pop, growing network' },
  { name: 'Mid-Size City', category: 'local', population: 75000, adoptionRate: 12, avgTransaction: 45, transactionsPerMonth: 6, merchantParticipation: 18, description: '75K pop, established' },
  { name: 'Large City', category: 'local', population: 250000, adoptionRate: 10, avgTransaction: 50, transactionsPerMonth: 7, merchantParticipation: 15, description: '250K pop, major metro' },
  { name: 'Metro Area', category: 'regional', population: 1000000, adoptionRate: 8, avgTransaction: 52, transactionsPerMonth: 7, merchantParticipation: 12, description: '1M pop, multi-city' },
  { name: 'State (Small)', category: 'regional', population: 3000000, adoptionRate: 5, avgTransaction: 48, transactionsPerMonth: 6, merchantParticipation: 10, description: 'e.g. Mississippi' },
  { name: 'State (Large)', category: 'regional', population: 20000000, adoptionRate: 4, avgTransaction: 55, transactionsPerMonth: 7, merchantParticipation: 8, description: 'e.g. Florida, New York' },
  { name: 'US Launch (1%)', category: 'national', population: 335000000, adoptionRate: 1, avgTransaction: 52, transactionsPerMonth: 6, merchantParticipation: 5, description: '3.35M users, early' },
  { name: 'US Growth (5%)', category: 'national', population: 335000000, adoptionRate: 5, avgTransaction: 55, transactionsPerMonth: 7, merchantParticipation: 8, description: '16.75M users' },
  { name: 'US Mature (15%)', category: 'national', population: 335000000, adoptionRate: 15, avgTransaction: 58, transactionsPerMonth: 8, merchantParticipation: 12, description: '50M users' },
  { name: 'North America', category: 'global', population: 580000000, adoptionRate: 8, avgTransaction: 55, transactionsPerMonth: 7, merchantParticipation: 10, description: 'US + Canada + Mexico' },
  { name: 'Western Markets', category: 'global', population: 1200000000, adoptionRate: 5, avgTransaction: 50, transactionsPerMonth: 7, merchantParticipation: 8, description: 'NA + EU + UK + AU' },
  { name: 'Global Reach', category: 'global', population: 4000000000, adoptionRate: 3, avgTransaction: 35, transactionsPerMonth: 5, merchantParticipation: 6, description: 'All connected adults' },
  { name: 'Amazon Scale', category: 'global', population: 4000000000, adoptionRate: 8, avgTransaction: 52, transactionsPerMonth: 8, merchantParticipation: 12, description: '310M+ buyers, $575B GMV' },
];

// Assumed average net profit margin used to project nonprofit/platform shares from gross volume.
// Actual per-transaction values depend on each merchant's COGS.
const ASSUMED_MARGIN = 0.35;

const BRAND = { purple: '#7851A9', lavender: '#CA9CE1', gold: '#C2A76F', crimson: '#A20021', dark: '#1A1A1A', light: '#FDFCFE' };
const PIE_COLORS = [BRAND.purple, BRAND.gold, BRAND.crimson, BRAND.lavender, '#34D399', '#60A5FA'];
const CATEGORY_COLORS: Record<string, string> = { local: BRAND.purple, regional: BRAND.gold, national: BRAND.crimson, global: '#34D399' };

function formatCurrency(n: number): string {
  if (n >= 1e12) return `$${(n/1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n/1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n/1e6).toFixed(1)}M`;
  if (n >= 1000) return `$${(n/1000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}
function formatNumber(n: number): string {
  if (n >= 1e9) return `${(n/1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n/1e6).toFixed(1)}M`;
  if (n >= 1000) return `${(n/1000).toFixed(1)}K`;
  return n.toFixed(0);
}
function getScaleLabel(pop: number): string {
  if (pop >= 1e9) return 'Global';
  if (pop >= 1e8) return 'National';
  if (pop >= 1e6) return 'Regional';
  return 'Local';
}

export const MunicipalDemoSimulator: React.FC = () => {
  const [cityName, setCityName] = useState('Your City');
  const [population, setPopulation] = useState(75000);
  const [adoptionRate, setAdoptionRate] = useState(8);
  const [merchantParticipation, setMerchantParticipation] = useState(15);
  const [avgTransactionSize, setAvgTransactionSize] = useState(45);
  const [transactionsPerMonth, setTransactionsPerMonth] = useState(6);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeChart, setActiveChart] = useState<'growth'|'money'|'impact'|'comparison'|'scale'>('growth');
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string|null>(null);

  const scaleLabel = getScaleLabel(population);
  const popToSlider = (p: number) => Math.log10(p) * 100;
  const sliderToPop = (v: number) => Math.round(Math.pow(10, v / 100));

  const metrics = useMemo(() => {
    const households = Math.round(population / 2.53);
    const activeConsumers = Math.round(population * (adoptionRate / 100));
    const activeMerchants = Math.max(1, Math.round(activeConsumers * (merchantParticipation / 100) * 0.05));
    const activeNonprofits = Math.max(3, Math.round(activeMerchants * 0.15));
    const monthlyTransactions = activeConsumers * transactionsPerMonth;
    const monthlyGrossVolume = monthlyTransactions * avgTransactionSize;
    const annualGrossVolume = monthlyGrossVolume * 12;
    const annualConsumerSavings = annualGrossVolume * 0.10;
    const annualNonprofitFunding = annualGrossVolume * ASSUMED_MARGIN * 0.10;
    const annualPlatformRevenue = annualGrossVolume * ASSUMED_MARGIN * 0.01;
    const annualMerchantRevenue = annualGrossVolume - annualConsumerSavings - annualNonprofitFunding - annualPlatformRevenue;
    const additionalLocalRetention = annualGrossVolume * 0.33;
    const multiplierEffect = additionalLocalRetention * 1.7;
    const jobsSupported = Math.round(multiplierEffect / 85000);
    const additionalTaxRevenue = additionalLocalRetention * 0.07;
    const savingsPerHousehold = activeConsumers > 0 ? annualConsumerSavings / Math.min(activeConsumers, households) : 0;
    const amazonGMV = 575e9;
    const amazonUsers = 310e6;
    return {
      households, activeConsumers, activeMerchants, activeNonprofits,
      monthlyTransactions, monthlyGrossVolume, annualGrossVolume,
      annualConsumerSavings, annualNonprofitFunding, annualPlatformRevenue, annualMerchantRevenue,
      additionalLocalRetention, multiplierEffect, jobsSupported, additionalTaxRevenue, savingsPerHousehold,
      gcVsAmazonVolume: annualGrossVolume / amazonGMV, gcVsAmazonUsers: activeConsumers / amazonUsers,
      amazonGMV, amazonUsers,
      amazonIfGC_savings: amazonGMV * 0.10, amazonIfGC_nonprofit: amazonGMV * ASSUMED_MARGIN * 0.10, amazonIfGC_platform: amazonGMV * ASSUMED_MARGIN * 0.01,
    };
  }, [population, adoptionRate, merchantParticipation, avgTransactionSize, transactionsPerMonth]);

  const growthData = useMemo(() => {
    const months: any[] = [];
    let cumS = 0, cumD = 0, cumV = 0;
    for (let m = 1; m <= 60; m++) {
      const ma = adoptionRate * (1 / (1 + Math.exp(-0.25 * (m - 12))));
      const c = Math.round(population * (ma / 100));
      const v = c * transactionsPerMonth * avgTransactionSize;
      const s = v * 0.10; const d = v * 0.10 * 0.35;
      cumS += s; cumD += d; cumV += v;
      months.push({ month: m % 12 === 0 ? `Y${m/12}` : (m % 6 === 0 ? `M${m}` : ''), monthNum: m, consumers: c, volume: Math.round(v), savings: Math.round(s), donations: Math.round(d), cumulativeSavings: cumS, cumulativeDonations: cumD, cumulativeVolume: cumV });
    }
    return months;
  }, [population, adoptionRate, avgTransactionSize, transactionsPerMonth]);

  const moneyFlowData = useMemo(() => [
    { name: 'Merchant Revenue', value: Math.round(metrics.annualMerchantRevenue), color: BRAND.purple },
    { name: 'Consumer Savings', value: Math.round(metrics.annualConsumerSavings), color: BRAND.gold },
    { name: 'Nonprofit Funding', value: Math.round(metrics.annualNonprofitFunding), color: '#34D399' },
    { name: 'Platform Fee (1%)', value: Math.round(metrics.annualPlatformRevenue), color: BRAND.lavender },
  ], [metrics]);

  const retentionComparison = [
    { category: 'Traditional Retail', local: 35, leakage: 65 },
    { category: 'Online/Chain', local: 15, leakage: 85 },
    { category: 'Good Circles', local: 68, leakage: 32 },
  ];

  const scaleComparisonData = useMemo(() => {
    return ['Small Town','Mid-Size City','Metro Area','US Growth (5%)','US Mature (15%)','Western Markets','Amazon Scale'].map(name => {
      const p = SCALE_PRESETS.find(pr => pr.name === name)!;
      const c = Math.round(p.population * (p.adoptionRate / 100));
      const v = c * p.transactionsPerMonth * p.avgTransaction * 12;
      return { name, consumers: c, volume: v, savings: v * 0.10, nonprofit: v * ASSUMED_MARGIN * 0.10, platform: v * ASSUMED_MARGIN * 0.01 };
    });
  }, []);

  const applyPreset = (p: ScalePreset) => {
    setCityName(p.name); setPopulation(p.population); setAdoptionRate(p.adoptionRate);
    setAvgTransactionSize(p.avgTransaction); setTransactionsPerMonth(p.transactionsPerMonth);
    setMerchantParticipation(p.merchantParticipation);
  };

  const cc = isPresentationMode ? "bg-white rounded-3xl p-8 border border-[#CA9CE1]/20 shadow-lg" : "bg-white rounded-2xl p-6 border border-[#CA9CE1]/20 shadow-sm";
  const ts = isPresentationMode ? "text-3xl" : "text-xl";
  const ss = isPresentationMode ? "text-5xl" : "text-3xl";
  const ls = isPresentationMode ? "text-sm" : "text-[10px]";

  return (
    <div className={`space-y-6 ${isPresentationMode ? 'p-4' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`${ts} font-black tracking-tight`}>Good Circles Impact Simulator</h2>
          <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white" style={{ backgroundColor: CATEGORY_COLORS[scaleLabel.toLowerCase()] || BRAND.purple }}>{scaleLabel} Scale</span>
            From community to global
          </p>
        </div>
        <button onClick={() => setIsPresentationMode(!isPresentationMode)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all ${isPresentationMode ? 'bg-[#7851A9] text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
          <Presentation size={16} />{isPresentationMode ? 'Exit Presentation' : 'Present'}
        </button>
      </div>

      {/* Presets */}
      <div className={cc}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black text-[#7851A9] uppercase tracking-widest">Scale Presets</h3>
          <div className="flex gap-2">
            {(['local','regional','national','global'] as const).map(cat => (
              <button key={cat} onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all border ${activeCategory === cat ? 'text-white border-transparent shadow-md' : 'bg-white text-slate-500 border-slate-200'}`}
                style={activeCategory === cat ? { backgroundColor: CATEGORY_COLORS[cat] } : {}}>
                {cat === 'local' ? '\uD83C\uDFD8\uFE0F' : cat === 'regional' ? '\uD83D\uDDFA\uFE0F' : cat === 'national' ? '\uD83C\uDDFA\uD83C\uDDF8' : '\uD83C\uDF0D'} {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {SCALE_PRESETS.filter(p => !activeCategory || p.category === activeCategory).map(preset => (
            <button key={preset.name} onClick={() => applyPreset(preset)}
              className={`p-3 rounded-xl text-left transition-all border ${cityName === preset.name ? 'border-[#7851A9] bg-[#7851A9]/5 shadow-md' : 'border-slate-100 hover:border-[#CA9CE1]/30 hover:bg-slate-50'}`}>
              <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: CATEGORY_COLORS[preset.category] }}>{preset.category}</div>
              <div className="text-xs font-bold text-slate-700 mt-1">{preset.name}</div>
              <div className="text-[9px] text-slate-400 mt-0.5">{preset.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Sliders */}
      <div className={cc}>
        <h3 className="text-sm font-black text-[#7851A9] uppercase tracking-widest mb-4">Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Market Name</label>
            <input type="text" value={cityName} onChange={e => setCityName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[#CA9CE1]/20 text-sm font-bold focus:ring-2 focus:ring-[#7851A9]/20 outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Market Size: {formatNumber(population)}</label>
            <input type="range" min={popToSlider(1000)} max={popToSlider(5e9)} step={1} value={popToSlider(population)} onChange={e => setPopulation(sliderToPop(Number(e.target.value)))} className="w-full h-2 rounded-full appearance-none cursor-pointer" style={{ accentColor: BRAND.purple }} />
            <div className="flex justify-between text-[9px] text-slate-300 mt-1"><span>1K</span><span>1M</span><span>1B</span><span>5B</span></div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Adoption: {adoptionRate}%</label>
            <input type="range" min={0.5} max={50} step={0.5} value={adoptionRate} onChange={e => setAdoptionRate(Number(e.target.value))} className="w-full h-2 rounded-full appearance-none cursor-pointer" style={{ accentColor: BRAND.gold }} />
            <div className="flex justify-between text-[9px] text-slate-300 mt-1"><span>0.5%</span><span>50%</span></div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Avg Transaction: ${avgTransactionSize}</label>
            <input type="range" min={5} max={300} step={5} value={avgTransactionSize} onChange={e => setAvgTransactionSize(Number(e.target.value))} className="w-full h-2 rounded-full appearance-none cursor-pointer" style={{ accentColor: BRAND.crimson }} />
            <div className="flex justify-between text-[9px] text-slate-300 mt-1"><span>$5</span><span>$300</span></div>
          </div>
        </div>
        <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1 mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-[#7851A9] transition-colors">
          {showAdvanced ? <ChevronUp size={14}/> : <ChevronDown size={14}/>} Advanced
        </button>
        {showAdvanced && (
          <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 pt-4 border-t border-slate-100">
            <div><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Merchant Participation: {merchantParticipation}%</label>
              <input type="range" min={1} max={50} value={merchantParticipation} onChange={e => setMerchantParticipation(Number(e.target.value))} className="w-full h-2 rounded-full appearance-none cursor-pointer" style={{accentColor:BRAND.purple}} /></div>
            <div><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Txns/Month: {transactionsPerMonth}</label>
              <input type="range" min={1} max={30} value={transactionsPerMonth} onChange={e => setTransactionsPerMonth(Number(e.target.value))} className="w-full h-2 rounded-full appearance-none cursor-pointer" style={{accentColor:BRAND.gold}} /></div>
          </motion.div>
        )}
      </div>

      {/* Headlines */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Users', value: formatNumber(metrics.activeConsumers), icon: Users, color: BRAND.purple, sub: `${adoptionRate}% of ${formatNumber(population)}` },
          { label: 'Annual Volume', value: formatCurrency(metrics.annualGrossVolume), icon: DollarSign, color: BRAND.gold, sub: `${formatNumber(metrics.monthlyTransactions)} txns/mo` },
          { label: 'Consumer Savings/Year', value: formatCurrency(metrics.annualConsumerSavings), icon: TrendingUp, color: '#34D399', sub: `${formatCurrency(metrics.savingsPerHousehold)}/household` },
          { label: 'Nonprofit Funding/Year', value: formatCurrency(metrics.annualNonprofitFunding), icon: Heart, color: BRAND.crimson, sub: `${formatNumber(metrics.activeNonprofits)} orgs` },
        ].map((c,i) => (
          <motion.div key={c.label} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.1}} className={cc}>
            <div className="flex items-center gap-2 mb-3"><div className="p-2 rounded-xl" style={{backgroundColor:c.color+'15'}}><c.icon size={isPresentationMode?24:18} style={{color:c.color}}/></div>
              <span className={`${ls} font-black text-slate-400 uppercase tracking-widest`}>{c.label}</span></div>
            <div className={`${ss} font-black tracking-tight`} style={{color:c.color}}>{c.value}</div>
            <div className="text-[11px] text-slate-400 mt-1">{c.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Secondary */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: 'Merchants', value: formatNumber(metrics.activeMerchants), color: BRAND.purple },
          { label: 'Nonprofits', value: formatNumber(metrics.activeNonprofits), color: BRAND.crimson },
          { label: 'Jobs Created', value: formatNumber(metrics.jobsSupported), color: '#34D399' },
          { label: "Add'l Tax Revenue", value: formatCurrency(metrics.additionalTaxRevenue), color: BRAND.gold },
          { label: 'Multiplier Effect', value: formatCurrency(metrics.multiplierEffect), color: BRAND.purple },
          { label: 'Platform Revenue', value: formatCurrency(metrics.annualPlatformRevenue), color: BRAND.lavender },
        ].map(m => (
          <div key={m.label} className="bg-white rounded-xl p-4 border border-[#CA9CE1]/10 text-center">
            <div className="text-2xl font-black" style={{color:m.color}}>{m.value}</div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Amazon Banner */}
      {metrics.annualGrossVolume > 1e9 && (
        <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} className="bg-gradient-to-r from-[#7851A9] to-[#CA9CE1] rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4"><Globe size={24}/><h3 className="text-lg font-black uppercase tracking-wider">Scale Comparison: Good Circles vs Amazon</h3></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><div className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Your Volume vs Amazon</div><div className="text-3xl font-black">{(metrics.gcVsAmazonVolume*100).toFixed(1)}%</div><div className="text-white/50 text-[10px]">of Amazon's $575B GMV</div></div>
            <div><div className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Your Users vs Amazon</div><div className="text-3xl font-black">{(metrics.gcVsAmazonUsers*100).toFixed(1)}%</div><div className="text-white/50 text-[10px]">of Amazon's 310M buyers</div></div>
            <div><div className="text-white/60 text-[10px] font-bold uppercase tracking-widest">If Amazon Had 10/10/1</div><div className="text-3xl font-black">{formatCurrency(metrics.amazonIfGC_savings)}</div><div className="text-white/50 text-[10px]">consumer savings/year</div></div>
            <div><div className="text-white/60 text-[10px] font-bold uppercase tracking-widest">If Amazon Had 10/10/1</div><div className="text-3xl font-black">{formatCurrency(metrics.amazonIfGC_nonprofit)}</div><div className="text-white/50 text-[10px]">to nonprofits/year</div></div>
          </div>
          <div className="mt-4 p-3 bg-white/10 rounded-xl"><p className="text-sm text-white/80">
            At Amazon's scale, the 10/10/1 model would save consumers {formatCurrency(metrics.amazonIfGC_savings)}/year, fund nonprofits with {formatCurrency(metrics.amazonIfGC_nonprofit)}/year, and sustain the platform on {formatCurrency(metrics.amazonIfGC_platform)}/year — transforming global commerce into a force for community good.
          </p></div>
        </motion.div>
      )}

      {/* Charts */}
      <div className={cc}>
        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4 flex-wrap">
          {[{id:'growth',label:'5-Year Growth'},{id:'money',label:'Money Flow'},{id:'impact',label:'Cumulative Impact'},{id:'comparison',label:'Local Retention'},{id:'scale',label:'Scale Comparison'}].map(tab => (
            <button key={tab.id} onClick={() => setActiveChart(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeChart===tab.id?'bg-[#7851A9] text-white shadow-md':'text-slate-400 hover:bg-slate-50'}`}>{tab.label}</button>
          ))}
        </div>
        <div style={{height:isPresentationMode?500:380}}>
          {activeChart === 'growth' && (
            <ResponsiveContainer width="100%" height="100%"><AreaChart data={growthData.filter((_,i)=>i%2===0)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis dataKey="month" tick={{fontSize:10,fill:'#94a3b8'}}/><YAxis tick={{fontSize:10,fill:'#94a3b8'}} tickFormatter={v=>formatNumber(v)}/>
              <Tooltip formatter={(v:number,n:string)=>[n.includes('onsumer')?formatNumber(v):formatCurrency(v),n]} contentStyle={{borderRadius:12,border:'1px solid #CA9CE1',fontSize:12}}/>
              <Legend wrapperStyle={{fontSize:11}}/><Area type="monotone" dataKey="consumers" stroke={BRAND.purple} fill={BRAND.purple+'20'} name="Active Users"/>
              <Area type="monotone" dataKey="volume" stroke={BRAND.gold} fill={BRAND.gold+'20'} name="Monthly Volume ($)"/>
            </AreaChart></ResponsiveContainer>
          )}
          {activeChart === 'money' && (
            <div className="flex items-center justify-center h-full gap-12">
              <ResponsiveContainer width="50%" height="100%"><PieChart><Pie data={moneyFlowData} cx="50%" cy="50%" outerRadius={isPresentationMode?160:120} innerRadius={isPresentationMode?80:60} paddingAngle={3} dataKey="value" label={({name,percent})=>`${name} (${(percent*100).toFixed(0)}%)`}>
                {moneyFlowData.map((_,i)=>(<Cell key={i} fill={PIE_COLORS[i]}/>))}</Pie><Tooltip formatter={(v:number)=>formatCurrency(v)}/></PieChart></ResponsiveContainer>
              <div className="space-y-4"><h4 className="text-sm font-black text-[#7851A9] uppercase tracking-widest">Annual Money Flow</h4>
                {moneyFlowData.map(item=>(<div key={item.name} className="flex items-center gap-3"><div className="w-4 h-4 rounded-full" style={{backgroundColor:item.color}}/><div><div className="text-sm font-bold text-slate-700">{item.name}</div><div className="text-lg font-black" style={{color:item.color}}>{formatCurrency(item.value)}</div></div></div>))}</div>
            </div>
          )}
          {activeChart === 'impact' && (
            <ResponsiveContainer width="100%" height="100%"><LineChart data={growthData.filter((_,i)=>i%2===0)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis dataKey="month" tick={{fontSize:10,fill:'#94a3b8'}}/><YAxis tick={{fontSize:10,fill:'#94a3b8'}} tickFormatter={v=>formatCurrency(v)}/>
              <Tooltip formatter={(v:number)=>formatCurrency(v)} contentStyle={{borderRadius:12,border:'1px solid #CA9CE1',fontSize:12}}/><Legend wrapperStyle={{fontSize:11}}/>
              <Line type="monotone" dataKey="cumulativeSavings" stroke={BRAND.gold} strokeWidth={3} name="Cumulative Consumer Savings" dot={false}/>
              <Line type="monotone" dataKey="cumulativeDonations" stroke="#34D399" strokeWidth={3} name="Cumulative Nonprofit Funding" dot={false}/>
              <Line type="monotone" dataKey="cumulativeVolume" stroke={BRAND.purple} strokeWidth={2} name="Cumulative Volume" dot={false} strokeDasharray="5 5"/>
            </LineChart></ResponsiveContainer>
          )}
          {activeChart === 'comparison' && (
            <ResponsiveContainer width="100%" height="100%"><BarChart data={retentionComparison} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis type="number" domain={[0,100]} tick={{fontSize:10,fill:'#94a3b8'}} tickFormatter={v=>`${v}%`}/>
              <YAxis type="category" dataKey="category" tick={{fontSize:12,fill:'#1A1A1A',fontWeight:700}} width={120}/>
              <Tooltip formatter={(v:number)=>`${v}%`} contentStyle={{borderRadius:12,border:'1px solid #CA9CE1',fontSize:12}}/><Legend wrapperStyle={{fontSize:11}}/>
              <Bar dataKey="local" name="Stays in Community" fill={BRAND.purple} radius={[0,8,8,0]}/><Bar dataKey="leakage" name="Leaves Community" fill="#E2E8F0" radius={[0,8,8,0]}/>
            </BarChart></ResponsiveContainer>
          )}
          {activeChart === 'scale' && (
            <ResponsiveContainer width="100%" height="100%"><BarChart data={scaleComparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis dataKey="name" tick={{fontSize:9,fill:'#94a3b8'}} angle={-20} textAnchor="end" height={60}/>
              <YAxis tick={{fontSize:10,fill:'#94a3b8'}} tickFormatter={v=>formatCurrency(v)}/><Tooltip formatter={(v:number)=>formatCurrency(v)} contentStyle={{borderRadius:12,border:'1px solid #CA9CE1',fontSize:12}}/>
              <Legend wrapperStyle={{fontSize:11}}/><Bar dataKey="savings" name="Consumer Savings" fill={BRAND.gold} radius={[4,4,0,0]}/>
              <Bar dataKey="nonprofit" name="Nonprofit Funding" fill="#34D399" radius={[4,4,0,0]}/><Bar dataKey="platform" name="Platform Revenue" fill={BRAND.lavender} radius={[4,4,0,0]}/>
            </BarChart></ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Talking Points */}
      <div className={cc}>
        <h3 className="text-sm font-black text-[#7851A9] uppercase tracking-widest mb-4">Key Talking Points — {cityName} ({scaleLabel})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {icon:DollarSign,title:'Consumer Impact',point:`At ${adoptionRate}% adoption, ${formatNumber(metrics.activeConsumers)} people save ${formatCurrency(metrics.annualConsumerSavings)}/year — ${formatCurrency(metrics.savingsPerHousehold)} per household.`},
            {icon:Heart,title:'Nonprofit Funding',point:`${formatNumber(metrics.activeNonprofits)} nonprofits receive ${formatCurrency(metrics.annualNonprofitFunding)} annually — funded by normal shopping, not extra giving.`},
            {icon:Building2,title:'Business Growth',point:`${formatNumber(metrics.activeMerchants)} merchants process ${formatCurrency(metrics.annualGrossVolume)} annually with 68% staying local vs 35% in traditional retail.`},
            {icon:MapPin,title:'Economic Multiplier',point:`${formatCurrency(metrics.additionalLocalRetention)} additional local circulation creates a ${formatCurrency(metrics.multiplierEffect)} multiplier supporting ${formatNumber(metrics.jobsSupported)} jobs.`},
            {icon:Zap,title:'Government Impact',point:`${formatCurrency(metrics.additionalTaxRevenue)} in additional tax revenue. Zero cost to government — the platform sustains itself on 1%.`},
            {icon:Target,title:'Platform Sustainability',point:`1% fee generates ${formatCurrency(metrics.annualPlatformRevenue)}/year — the lowest fee in the industry, scaling automatically with adoption.`},
          ].map((tp,i) => (
            <div key={i} className="flex gap-3 p-4 rounded-xl bg-slate-50/50 border border-slate-100">
              <div className="p-2 rounded-lg bg-[#7851A9]/10 h-fit"><tp.icon size={16} className="text-[#7851A9]"/></div>
              <div><div className="text-xs font-black text-slate-700 mb-1">{tp.title}</div><div className="text-[11px] text-slate-500 leading-relaxed">{tp.point}</div></div>
            </div>
          ))}
        </div>
      </div>

      {/* Scenario Table */}
      <div className={cc}>
        <h3 className="text-sm font-black text-[#7851A9] uppercase tracking-widest mb-4">Scale Scenario Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left"><thead><tr className="border-b-2 border-[#7851A9]/20">
            <th className="py-3 px-3 text-[10px] font-black text-[#7851A9] uppercase tracking-widest">Metric</th>
            {['Small Town','Mid-Size City','US Growth (5%)','Amazon Scale'].map(name => {
              const pr = SCALE_PRESETS.find(p=>p.name===name)!;
              return <th key={name} className={`py-3 px-3 text-[10px] font-black uppercase tracking-widest text-center ${cityName===name?'text-[#7851A9] bg-[#7851A9]/5':'text-slate-400'}`}><div>{name}</div><div className="text-[8px] font-normal text-slate-300">{pr.description}</div></th>;
            })}
          </tr></thead><tbody>
            {(() => {
              const scenarios = ['Small Town','Mid-Size City','US Growth (5%)','Amazon Scale'].map(name => {
                const p = SCALE_PRESETS.find(pr=>pr.name===name)!;
                const c = Math.round(p.population*(p.adoptionRate/100));
                const v = c*p.transactionsPerMonth*p.avgTransaction*12;
                return {name,consumers:c,volume:v,savings:v*0.10,nonprofit:v*ASSUMED_MARGIN*0.10,platform:v*ASSUMED_MARGIN*0.01,jobs:Math.round(v*0.33*1.7/85000)};
              });
              return [{l:'Active Users',k:'consumers',f:formatNumber},{l:'Annual Volume',k:'volume',f:formatCurrency},{l:'Consumer Savings',k:'savings',f:formatCurrency},{l:'Nonprofit Funding',k:'nonprofit',f:formatCurrency},{l:'Platform Revenue',k:'platform',f:formatCurrency},{l:'Jobs Supported',k:'jobs',f:formatNumber}].map((row,i) => (
                <tr key={row.l} className={i%2===0?'bg-slate-50/50':''}>
                  <td className="py-3 px-3 text-xs font-bold text-slate-600">{row.l}</td>
                  {scenarios.map(s => <td key={s.name} className={`py-3 px-3 text-sm font-bold text-center ${cityName===s.name?'text-[#7851A9] bg-[#7851A9]/5 font-black':'text-slate-700'}`}>{row.f((s as any)[row.k])}</td>)}
                </tr>
              ));
            })()}
          </tbody></table>
        </div>
      </div>

      <div className="text-center py-6">
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Good Circles Impact Simulator — Economic projections</p>
        <p className="text-[9px] text-slate-300 mt-1">Amazon data from public 2025 reports. Results vary by market conditions.</p>
      </div>
    </div>
  );
};
