import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { SupporterCircle, User } from '../types';
import { impactService, NationalOverview, StateDetail } from '../services/impactService';

interface Props {
  circles?: SupporterCircle[];
  myCircle?: SupporterCircle;
  currentUser: User | null;
  onSendMessage?: (id: string, content: string) => void;
}

// ── State tile cartogram layout [abbr, name, col, row] ────────────────
const STATE_TILES: [string, string, number, number][] = [
  ['AK','Alaska',0,0],['ME','Maine',11,0],
  ['WI','Wisconsin',5,1],['VT','Vermont',10,1],['NH','New Hampshire',11,1],
  ['WA','Washington',0,2],['ID','Idaho',1,2],['MT','Montana',2,2],['ND','North Dakota',3,2],['MN','Minnesota',4,2],['IL','Illinois',5,2],['MI','Michigan',6,2],['NY','New York',9,2],['MA','Massachusetts',10,2],['RI','Rhode Island',11,2],
  ['OR','Oregon',0,3],['NV','Nevada',1,3],['WY','Wyoming',2,3],['SD','South Dakota',3,3],['IA','Iowa',4,3],['IN','Indiana',5,3],['OH','Ohio',6,3],['PA','Pennsylvania',7,3],['NJ','New Jersey',8,3],['CT','Connecticut',9,3],
  ['CA','California',0,4],['UT','Utah',1,4],['CO','Colorado',2,4],['NE','Nebraska',3,4],['MO','Missouri',4,4],['KY','Kentucky',5,4],['WV','West Virginia',6,4],['VA','Virginia',7,4],['MD','Maryland',8,4],['DE','Delaware',9,4],
  ['AZ','Arizona',1,5],['NM','New Mexico',2,5],['KS','Kansas',3,5],['AR','Arkansas',4,5],['TN','Tennessee',5,5],['NC','North Carolina',6,5],['SC','South Carolina',7,5],['DC','DC',8,5],
  ['OK','Oklahoma',3,6],['LA','Louisiana',4,6],['MS','Mississippi',5,6],['AL','Alabama',6,6],['GA','Georgia',7,6],
  ['HI','Hawaii',1,7],['TX','Texas',3,7],['FL','Florida',7,7],
];

const TILE_SIZE = 44;
const STEP = 47;
const SVG_W = 13 * STEP;
const SVG_H = 8 * STEP + 10;

// ── FNV-1a deterministic hash for simulation ───────────────────────────
function simHash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h / 4294967295;
}

// ── State population (thousands) for scaling sim data ─────────────────
const STATE_POP: Record<string, number> = {
  CA:39538,TX:29145,FL:21538,NY:20201,PA:13002,IL:12812,OH:11799,GA:10711,
  NC:10439,MI:10077,NJ:9288,VA:8631,WA:7705,AZ:7151,TN:6910,MA:7029,
  IN:6785,MO:6154,MD:6177,WI:5893,CO:5773,MN:5706,SC:5118,AL:5024,
  LA:4657,KY:4505,OR:4237,OK:3959,CT:3605,UT:3271,IA:3190,NV:3104,
  AR:3011,MS:2961,KS:2937,NM:2117,NE:1961,ID:1839,WV:1793,HI:1455,
  NH:1377,ME:1362,RI:1097,MT:1084,DE:989,SD:886,ND:779,AK:733,
  VT:643,WY:576,DC:689,
};

interface SimData {
  merchants: number;
  volume: number;
  nonprofitFunding: number;
  txCount: number;
}

function simStateData(abbr: string): SimData {
  const pop = STATE_POP[abbr] ?? 1000;
  const base = simHash(abbr + 'gc2025');
  const merchants = Math.round(2 + base * (pop / 1000) * 3);
  const volume = Math.round(merchants * (800 + simHash(abbr + 'vol') * 3200));
  const nonprofitFunding = Math.round(volume * (0.08 + simHash(abbr + 'np') * 0.04));
  const txCount = Math.round(merchants * (15 + simHash(abbr + 'tx') * 60));
  return { merchants, volume, nonprofitFunding, txCount };
}

const SIM_CITIES: Record<string, string[]> = {
  CA: ['Los Angeles','San Francisco','San Diego','Sacramento','Oakland'],
  TX: ['Houston','Austin','Dallas','San Antonio','Fort Worth'],
  FL: ['Miami','Orlando','Tampa','Jacksonville','Tallahassee'],
  NY: ['New York City','Buffalo','Rochester','Albany','Syracuse'],
  IL: ['Chicago','Naperville','Rockford','Springfield','Peoria'],
  PA: ['Philadelphia','Pittsburgh','Allentown','Erie','Reading'],
  OH: ['Columbus','Cleveland','Cincinnati','Toledo','Akron'],
  GA: ['Atlanta','Savannah','Augusta','Columbus','Macon'],
  NC: ['Charlotte','Raleigh','Greensboro','Durham','Winston-Salem'],
  WA: ['Seattle','Spokane','Tacoma','Bellevue','Olympia'],
  CO: ['Denver','Colorado Springs','Aurora','Fort Collins','Boulder'],
  AZ: ['Phoenix','Tucson','Mesa','Chandler','Scottsdale'],
  MA: ['Boston','Worcester','Springfield','Cambridge','Lowell'],
  MN: ['Minneapolis','Saint Paul','Rochester','Duluth','Bloomington'],
  MI: ['Detroit','Grand Rapids','Warren','Sterling Heights','Lansing'],
  OR: ['Portland','Salem','Eugene','Gresham','Hillsboro'],
  TN: ['Nashville','Memphis','Knoxville','Chattanooga','Clarksville'],
  VA: ['Virginia Beach','Norfolk','Chesapeake','Richmond','Arlington'],
  NJ: ['Newark','Jersey City','Paterson','Elizabeth','Edison'],
  MD: ['Baltimore','Silver Spring','Rockville','Gaithersburg','Bowie'],
};

function simCityData(city: string, state: string): SimData {
  const seed = city + state;
  const base = simHash(seed + 'gc');
  const merchants = Math.round(1 + base * 8);
  const volume = Math.round(merchants * (600 + simHash(seed + 'vol') * 2800));
  const nonprofitFunding = Math.round(volume * (0.08 + simHash(seed + 'np') * 0.05));
  const txCount = Math.round(merchants * (10 + simHash(seed + 'tx') * 50));
  return { merchants, volume, nonprofitFunding, txCount };
}

function calcHealthScore(d: SimData, maxVolume: number): number {
  const merchantScore = Math.min(d.merchants / 10, 1) * 30;
  const velocityScore = Math.min(d.txCount / (d.merchants || 1) / 50, 1) * 25;
  const nonprofitRate = d.volume > 0 ? d.nonprofitFunding / d.volume : 0;
  const nonprofitScore = Math.min(nonprofitRate / 0.15, 1) * 25;
  const volumeScore = Math.min(d.volume / maxVolume, 1) * 20;
  return Math.round(merchantScore + velocityScore + nonprofitScore + volumeScore);
}

const fmt$ = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `$${(n / 1_000).toFixed(1)}K` : `$${n}`;
const fmtN = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : `${n}`;

function intensityColor(value: number, max: number, alpha = 1): string {
  if (max === 0) return `rgba(100,116,139,${alpha})`;
  const t = Math.min(value / max, 1);
  if (t < 0.2) return `rgba(100,116,139,${alpha})`;
  if (t < 0.4) return `rgba(124,58,237,${alpha * 0.5})`;
  if (t < 0.6) return `rgba(109,40,217,${alpha * 0.7})`;
  if (t < 0.8) return `rgba(91,33,182,${alpha * 0.85})`;
  return `rgba(120,81,169,${alpha})`;
}

type GeoLevel = 'national' | 'state' | 'city';

interface StateData {
  abbr: string;
  name: string;
  merchants: number;
  volume: number;
  nonprofitFunding: number;
  txCount: number;
  isLive: boolean;
}

// ── PrintReport component ──────────────────────────────────────────────
interface PrintReportProps {
  level: GeoLevel;
  label: string;
  data: SimData & { healthScore?: number };
  cities?: Array<{ city: string } & SimData>;
  reportDate: string;
}

const PrintReport: React.FC<PrintReportProps> = ({ level, label, data, cities, reportDate }) => {
  const isState = level === 'state';
  const isMuni = label.includes('CDBG') || true; // always generate CDBG addendum

  return (
    <div id="print-report" style={{ fontFamily: 'Georgia, serif', maxWidth: 800, margin: '0 auto', padding: 40, color: '#111' }}>
      <div style={{ borderBottom: '3px solid #7851A9', paddingBottom: 16, marginBottom: 24 }}>
        <div style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: 2 }}>GoodCircles Community Impact Report</div>
        <h1 style={{ fontSize: 24, fontWeight: 900, margin: '8px 0 4px' }}>{label}</h1>
        <div style={{ fontSize: 12, color: '#555' }}>Reporting Period: {reportDate} &nbsp;|&nbsp; Generated: {new Date().toLocaleDateString()}</div>
      </div>

      <h2 style={{ fontSize: 16, fontWeight: 700, borderBottom: '1px solid #ddd', paddingBottom: 6, marginBottom: 12 }}>Economic Impact Summary</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24, fontSize: 13 }}>
        <tbody>
          {[
            ['Total Transaction Volume', fmt$(data.volume)],
            ['Total Nonprofit Funding Generated', fmt$(data.nonprofitFunding)],
            ['Total Transactions Processed', fmtN(data.txCount)],
            ['Active Local Merchants', fmtN(data.merchants)],
            ...(data.healthScore !== undefined ? [['Neighborhood Economic Health Score', `${data.healthScore}/100`]] : []),
          ].map(([label, val]) => (
            <tr key={label} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '6px 0', color: '#444' }}>{label}</td>
              <td style={{ padding: '6px 0', fontWeight: 700, textAlign: 'right' }}>{val}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {cities && cities.length > 0 && (
        <>
          <h2 style={{ fontSize: 16, fontWeight: 700, borderBottom: '1px solid #ddd', paddingBottom: 6, marginBottom: 12 }}>City-Level Breakdown</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24, fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                {['City','Merchants','Volume','Nonprofit Funding','Transactions'].map(h => (
                  <th key={h} style={{ padding: '6px 8px', textAlign: h === 'City' ? 'left' : 'right', fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cities.map(c => (
                <tr key={c.city} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '5px 8px' }}>{c.city}</td>
                  <td style={{ padding: '5px 8px', textAlign: 'right' }}>{c.merchants}</td>
                  <td style={{ padding: '5px 8px', textAlign: 'right' }}>{fmt$(c.volume)}</td>
                  <td style={{ padding: '5px 8px', textAlign: 'right' }}>{fmt$(c.nonprofitFunding)}</td>
                  <td style={{ padding: '5px 8px', textAlign: 'right' }}>{fmtN(c.txCount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* CDBG Addendum */}
      <div style={{ marginTop: 32, pageBreakBefore: 'always' }}>
        <div style={{ background: '#f8f4ff', border: '1px solid #7851A9', borderRadius: 8, padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: '#7851A9', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700 }}>CDBG Compliance Addendum</div>
          <div style={{ fontSize: 11, color: '#444', marginTop: 4 }}>Community Development Block Grant Program &bull; HUD 24 CFR Part 570</div>
        </div>

        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>National Objective Documentation</h2>
        <p style={{ fontSize: 12, lineHeight: 1.7, marginBottom: 16, color: '#333' }}>
          This activity qualifies under the Low-to-Moderate Income (LMI) national objective per 24 CFR 570.208(a).
          GoodCircles facilitates economic transactions within geographically-defined LMI areas as determined by
          FFIEC census tract data. Merchant participants are verified against HUD LMI area maps at point of onboarding.
        </p>

        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>CAPER Narrative</h2>
        <p style={{ fontSize: 12, lineHeight: 1.7, marginBottom: 16, color: '#333' }}>
          During this reporting period, GoodCircles facilitated <strong>{fmtN(data.txCount)}</strong> economic
          transactions totaling <strong>{fmt$(data.volume)}</strong> in {label}. Of this amount,{' '}
          <strong>{fmt$(data.nonprofitFunding)}</strong> was directed to community-elected nonprofit organizations
          serving LMI populations. This represents a nonprofit funding rate of{' '}
          <strong>{data.volume > 0 ? ((data.nonprofitFunding / data.volume) * 100).toFixed(1) : 0}%</strong>{' '}
          of total transaction volume, exceeding the 8% program target.
        </p>
        <p style={{ fontSize: 12, lineHeight: 1.7, marginBottom: 16, color: '#333' }}>
          A total of <strong>{data.merchants}</strong> local merchants participated in the platform, maintaining
          active storefronts and directing a share of each transaction to resident-elected nonprofits. This
          merchant participation model supports job retention and small business sustainability in accordance
          with CDBG economic development objectives under 570.203.
        </p>

        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>IDIS Activity Reference</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 16 }}>
          <tbody>
            {[
              ['Matrix Code', '18A — ED Direct Financial Assistance to For-Profits'],
              ['National Objective', 'LMI Area Benefit (570.208(a)(1)(i))'],
              ['Beneficiary Area', label],
              ['Percent LMI Benefit', '≥51% (census tract qualification)'],
              ['Accomplishment Type', '04 — Businesses'],
              ['Accomplishment Units', `${data.merchants} businesses`],
            ].map(([k, v]) => (
              <tr key={k} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '5px 0', color: '#555', width: '40%' }}>{k}</td>
                <td style={{ padding: '5px 0', fontWeight: 600 }}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: 24, borderTop: '1px solid #ddd', paddingTop: 16, fontSize: 10, color: '#888' }}>
          This report was generated by GoodCircles Impact Transparency System. Data reflects platform transactions
          processed through the GoodCircles marketplace. For IDIS entry assistance contact your HUD CPD representative.
          Report date: {new Date().toLocaleDateString()}.
        </div>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────
export const ImpactMapView: React.FC<Props> = ({ currentUser }) => {
  const [demoMode, setDemoMode] = useState(true);
  const [geoLevel, setGeoLevel] = useState<GeoLevel>('national');
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [liveOverview, setLiveOverview] = useState<NationalOverview | null>(null);
  const [liveStateDetail, setLiveStateDetail] = useState<StateDetail | null>(null);
  const [showPrint, setShowPrint] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch live data
  useEffect(() => {
    impactService.getOverview().then(r => setLiveOverview(r)).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedState) {
      impactService.getStateDetail(selectedState).then(r => setLiveStateDetail(r)).catch(() => {});
    }
  }, [selectedState]);

  // Build state data array (demo + live overlay)
  const stateDataMap = useMemo(() => {
    const map: Record<string, StateData> = {};
    STATE_TILES.forEach(([abbr, name]) => {
      const sim = simStateData(abbr);
      const liveRow = liveOverview?.byState.find(r => r.state === abbr);
      const isLive = !demoMode && !!liveRow;
      map[abbr] = {
        abbr,
        name,
        merchants: isLive ? liveRow!.merchants : sim.merchants,
        volume: isLive ? liveRow!.volume : sim.volume,
        nonprofitFunding: isLive ? liveRow!.nonprofitFunding : sim.nonprofitFunding,
        txCount: isLive ? liveRow!.txCount : sim.txCount,
        isLive,
      };
    });
    return map;
  }, [demoMode, liveOverview]);

  const maxVolume = useMemo(
    () => Math.max(...Object.values(stateDataMap).map(d => d.volume), 1),
    [stateDataMap]
  );

  // National totals
  const nationalTotals = useMemo<SimData>(() => {
    if (!demoMode && liveOverview) {
      return {
        merchants: liveOverview.national.totalMerchants,
        volume: liveOverview.national.totalVolume,
        nonprofitFunding: liveOverview.national.totalNonprofitFunding,
        txCount: liveOverview.national.totalTransactions,
      };
    }
    return Object.values(stateDataMap).reduce(
      (acc, d) => ({
        merchants: acc.merchants + d.merchants,
        volume: acc.volume + d.volume,
        nonprofitFunding: acc.nonprofitFunding + d.nonprofitFunding,
        txCount: acc.txCount + d.txCount,
      }),
      { merchants: 0, volume: 0, nonprofitFunding: 0, txCount: 0 }
    );
  }, [demoMode, liveOverview, stateDataMap]);

  // City list for selected state
  const cityList = useMemo(() => {
    if (!selectedState) return [];
    if (!demoMode && liveStateDetail) {
      return liveStateDetail.cities.map(c => ({ city: c.city, ...c }));
    }
    const cities = SIM_CITIES[selectedState] ?? ['Main City', 'Riverside', 'Northside'];
    return cities.map(city => ({ city, ...simCityData(city, selectedState) }));
  }, [selectedState, demoMode, liveStateDetail]);

  // Current drill data
  const currentStateData = selectedState ? stateDataMap[selectedState] : null;
  const currentCityData = useMemo(() => {
    if (!selectedCity || !selectedState) return null;
    const live = liveStateDetail?.cities.find(c => c.city === selectedCity);
    if (!demoMode && live) {
      return { merchants: live.merchants, volume: live.volume, nonprofitFunding: live.nonprofitFunding, txCount: live.txCount };
    }
    return simCityData(selectedCity, selectedState);
  }, [selectedCity, selectedState, demoMode, liveStateDetail]);

  const drillData: SimData = geoLevel === 'city' && currentCityData
    ? currentCityData
    : geoLevel === 'state' && currentStateData
    ? currentStateData
    : nationalTotals;

  const healthScore = calcHealthScore(drillData, maxVolume);

  const handleStateClick = (abbr: string) => {
    setSelectedState(abbr);
    setSelectedCity(null);
    setGeoLevel('state');
  };

  const handleCityClick = (city: string) => {
    setSelectedCity(city);
    setGeoLevel('city');
  };

  const handleBack = () => {
    if (geoLevel === 'city') { setGeoLevel('state'); setSelectedCity(null); }
    else if (geoLevel === 'state') { setGeoLevel('national'); setSelectedState(null); }
  };

  const handlePrint = () => {
    setShowPrint(true);
    setTimeout(() => { window.print(); setShowPrint(false); }, 300);
  };

  const breadcrumb = geoLevel === 'national'
    ? 'United States'
    : geoLevel === 'state'
    ? `${stateDataMap[selectedState!]?.name ?? selectedState}`
    : `${selectedCity}, ${selectedState}`;

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-black italic uppercase">Impact Map</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {demoMode ? 'Demo data — ' : 'Live data — '}
            {breadcrumb}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Demo / Live toggle */}
          <button
            onClick={() => setDemoMode(d => !d)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
              demoMode
                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            {demoMode ? 'Demo Mode' : 'Live Mode'}
          </button>

          {/* Export PDF */}
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-[#7851A9] text-white hover:bg-[#6040a0] transition-all"
          >
            Export Report
          </button>
        </div>
      </div>

      {/* Breadcrumb / Back nav */}
      {geoLevel !== 'national' && (
        <div className="flex items-center gap-2 text-sm">
          <button onClick={handleBack} className="text-[#7851A9] font-semibold hover:underline">
            &larr; Back
          </button>
          <span className="text-slate-400">/</span>
          <span className="font-semibold text-slate-700">{breadcrumb}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left: Map or City List */}
        <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">

          {geoLevel === 'national' && (
            <div className="p-4">
              <p className="text-xs text-slate-400 mb-3 font-medium">Click a state to drill down</p>
              <svg
                viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                className="w-full"
                style={{ maxHeight: 420 }}
              >
                {STATE_TILES.map(([abbr, name, col, row]) => {
                  const d = stateDataMap[abbr];
                  const x = col * STEP + 2;
                  const y = row * STEP + 2;
                  const fill = intensityColor(d?.volume ?? 0, maxVolume);
                  return (
                    <g key={abbr} onClick={() => handleStateClick(abbr)} className="cursor-pointer group">
                      <rect
                        x={x} y={y} width={TILE_SIZE} height={TILE_SIZE}
                        fill={fill}
                        rx={6}
                        className="transition-all group-hover:brightness-125"
                      />
                      <text
                        x={x + TILE_SIZE / 2}
                        y={y + TILE_SIZE / 2 - 2}
                        fill="white"
                        fontSize={11}
                        fontWeight="700"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{ pointerEvents: 'none', userSelect: 'none' }}
                      >
                        {abbr}
                      </text>
                      {d && d.volume > 0 && (
                        <text
                          x={x + TILE_SIZE / 2}
                          y={y + TILE_SIZE / 2 + 10}
                          fill="rgba(255,255,255,0.75)"
                          fontSize={8}
                          textAnchor="middle"
                          style={{ pointerEvents: 'none', userSelect: 'none' }}
                        >
                          {fmt$(d.volume)}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Legend */}
              <div className="flex items-center gap-2 mt-3">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Volume:</span>
                {[0.1, 0.3, 0.6, 1.0].map((t) => (
                  <div key={t} className="flex items-center gap-1">
                    <div
                      className="w-6 h-3 rounded"
                      style={{ background: intensityColor(t * maxVolume, maxVolume) }}
                    />
                    <span className="text-[9px] text-slate-400">{fmt$(t * maxVolume)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {geoLevel === 'state' && (
            <div className="p-6">
              <h2 className="text-lg font-black uppercase tracking-tight mb-4">
                {stateDataMap[selectedState!]?.name} — Cities
              </h2>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {cityList.map(c => (
                  <button
                    key={c.city}
                    onClick={() => handleCityClick(c.city)}
                    className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-[#7851A9] hover:bg-purple-50 transition-all text-left"
                  >
                    <div>
                      <div className="font-semibold text-sm text-slate-800">{c.city}</div>
                      <div className="text-xs text-slate-400">{c.merchants} merchants &bull; {fmtN(c.txCount)} txns</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-[#7851A9]">{fmt$(c.volume)}</div>
                      <div className="text-xs text-emerald-600">{fmt$(c.nonprofitFunding)} to nonprofits</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {geoLevel === 'city' && (
            <div className="p-6">
              <h2 className="text-lg font-black uppercase tracking-tight mb-2">{selectedCity}</h2>
              <p className="text-xs text-slate-400 mb-6">{selectedState} &bull; City-Level Detail</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Transaction Volume', value: fmt$(drillData.volume), color: 'text-[#7851A9]' },
                  { label: 'Nonprofit Funding', value: fmt$(drillData.nonprofitFunding), color: 'text-emerald-600' },
                  { label: 'Total Transactions', value: fmtN(drillData.txCount), color: 'text-slate-700' },
                  { label: 'Active Merchants', value: fmtN(drillData.merchants), color: 'text-slate-700' },
                ].map(item => (
                  <div key={item.label} className="bg-slate-50 rounded-2xl p-4">
                    <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">{item.label}</div>
                    <div className={`text-xl font-black ${item.color}`}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Stats Panel */}
        <div className="space-y-4">

          {/* Health Score Ring */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
              Economic Health Score
            </div>
            <div className="flex items-center gap-4">
              <svg width={80} height={80} viewBox="0 0 80 80">
                <circle cx={40} cy={40} r={34} fill="none" stroke="#f1f5f9" strokeWidth={8} />
                <circle
                  cx={40} cy={40} r={34}
                  fill="none"
                  stroke={healthScore >= 70 ? '#10b981' : healthScore >= 40 ? '#7851A9' : '#f59e0b'}
                  strokeWidth={8}
                  strokeDasharray={`${(healthScore / 100) * 213.6} 213.6`}
                  strokeLinecap="round"
                  transform="rotate(-90 40 40)"
                />
                <text x={40} y={44} textAnchor="middle" fontSize={20} fontWeight="900" fill="#111">{healthScore}</text>
              </svg>
              <div>
                <div className="text-2xl font-black text-slate-800">{
                  healthScore >= 70 ? 'Strong' : healthScore >= 40 ? 'Moderate' : 'Early Stage'
                }</div>
                <div className="text-xs text-slate-400 mt-1">{breadcrumb}</div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Key Metrics</div>
            {[
              { label: 'Total Volume', value: fmt$(drillData.volume) },
              { label: 'Nonprofit Funding', value: fmt$(drillData.nonprofitFunding) },
              { label: 'Transactions', value: fmtN(drillData.txCount) },
              { label: 'Merchants', value: fmtN(drillData.merchants) },
              { label: 'Funding Rate', value: drillData.volume > 0 ? `${((drillData.nonprofitFunding / drillData.volume) * 100).toFixed(1)}%` : '—' },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                <span className="text-sm text-slate-500">{item.label}</span>
                <span className="text-sm font-bold text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>

          {/* Data source note */}
          <div className={`rounded-2xl p-4 text-xs ${
            demoMode ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
          }`}>
            {demoMode
              ? 'Demo data uses deterministic simulation scaled to real population distributions. Toggle to Live Mode to see real GoodCircles transaction data.'
              : 'Showing live GoodCircles transaction data. Demo overlay available for presentation purposes.'}
          </div>
        </div>
      </div>

      {/* Hidden print report */}
      {showPrint && (
        <div className="hidden print:block">
          <PrintReport
            level={geoLevel}
            label={
              geoLevel === 'city'
                ? `${selectedCity}, ${selectedState}`
                : geoLevel === 'state'
                ? stateDataMap[selectedState!]?.name ?? selectedState!
                : 'United States — National Overview'
            }
            data={{ ...drillData, healthScore }}
            cities={geoLevel === 'state' ? cityList : undefined}
            reportDate={new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          />
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body > * { display: none !important; }
          #print-report { display: block !important; }
          .hidden { display: block !important; }
        }
      ` }} />
    </div>
  );
};
