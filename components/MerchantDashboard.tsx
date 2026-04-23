
import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { merchantService } from '../services/merchantService';
import { DollarSign, TrendingUp, Heart, Shield, Percent, ArrowUpRight, ArrowDownRight, Zap, Users, Target, Lightbulb } from 'lucide-react';
import { format, subDays } from 'date-fns';

const DEMO_METRICS = {
  totalSales: 12480.00,
  netRevenue: 9984.00,
  discountsGiven: 1248.00,
  nonprofitContributions: 998.40,
  processingFeesSaved: 311.40,
};

const DEMO_CHART = Array.from({ length: 30 }, (_, i) => ({
  date: subDays(new Date(), 29 - i).toISOString(),
  revenue: Math.round(200 + Math.random() * 600 + (i > 20 ? i * 15 : 0)),
}));

const DEMO_TRANSACTIONS = [
  { grossAmount: 57.00, merchantNet: 45.60, createdAt: subDays(new Date(), 0).toISOString(), productService: { name: 'Artisan Bread Loaf' } },
  { grossAmount: 34.50, merchantNet: 27.60, createdAt: subDays(new Date(), 1).toISOString(), productService: { name: 'Local Honey Jar' } },
  { grossAmount: 128.00, merchantNet: 102.40, createdAt: subDays(new Date(), 1).toISOString(), productService: { name: 'Weekly CSA Box' } },
  { grossAmount: 22.00, merchantNet: 17.60, createdAt: subDays(new Date(), 2).toISOString(), productService: { name: 'Farm Fresh Eggs' } },
  { grossAmount: 89.00, merchantNet: 71.20, createdAt: subDays(new Date(), 3).toISOString(), productService: { name: 'Herb Garden Kit' } },
];

const COPILOT_INSIGHTS = [
  {
    icon: TrendingUp,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    label: 'Sales Pattern Detected',
    headline: 'Weekday items sell 40% faster than weekend listings',
    detail: 'Your lunch-hour and midweek items show significantly higher sell-through. A Tuesday promotion could capture peak demand.',
    query: 'My weekday items outperform weekend items by 40%. What promotions or pricing strategies would help me capitalize on this pattern?',
  },
  {
    icon: Users,
    color: 'text-[#7851A9]',
    bg: 'bg-[#7851A9]/10',
    label: 'Repeat Customer Opportunity',
    headline: '3 customers have purchased from you 3+ times',
    detail: 'You have loyal regulars building. A loyalty recognition or bundle offer could convert them into monthly anchors.',
    query: 'I have repeat customers buying 3+ times. How should I reward loyalty within the GoodCircles model without undercutting my margin?',
  },
  {
    icon: Target,
    color: 'text-[#C2A76F]',
    bg: 'bg-amber-50',
    label: 'Nonprofit Milestone Approaching',
    headline: 'On pace to generate $1,000 for Community Food Bank',
    detail: 'At current velocity, you\'ll hit a $1,000 nonprofit contribution milestone next month. This is a story worth sharing.',
    query: 'I\'m approaching $1,000 in nonprofit contributions through my sales. How can I use this milestone to attract new customers?',
  },
  {
    icon: Lightbulb,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    label: 'Niche Gap Identified',
    headline: 'No merchant in your node offers gift bundles',
    detail: 'Across 70 marketplace listings, zero merchants offer curated gift sets. This high-margin category is wide open.',
    query: 'There are no gift bundle offerings in the marketplace. How should I structure a gift set offering and what price point works best with the 10/10/1 model?',
  },
];

interface Props {
  onOpenAdvisor?: (query: string) => void;
}

export const MerchantDashboard: React.FC<Props> = ({ onOpenAdvisor }) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [m, c, t] = await Promise.all([
          merchantService.getDashboardMetrics(),
          merchantService.getRevenueChartData(),
          merchantService.getTransactions()
        ]);
        setMetrics(m);
        setChartData(c);
        setTransactions(t.slice(0, 5)); // Only show recent 5
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  const isDemo = !metrics || metrics.totalSales === 0;
  const activeMetrics = isDemo ? DEMO_METRICS : metrics;
  const activeChart = isDemo ? DEMO_CHART : chartData;
  const activeTransactions = isDemo ? DEMO_TRANSACTIONS : transactions;

  const metricCards = [
    { label: 'Total Sales', value: activeMetrics?.totalSales, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50', note: undefined },
    { label: 'Net Revenue', value: activeMetrics?.netRevenue, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', note: undefined },
    { label: 'Discounts Given', value: activeMetrics?.discountsGiven, icon: Percent, color: 'text-amber-600', bg: 'bg-amber-50', note: 'Tax deductible' },
    { label: 'Nonprofit Donations', value: activeMetrics?.nonprofitContributions, icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50', note: 'Tax deductible' },
    { label: 'Processing Saved', value: activeMetrics?.processingFeesSaved, icon: Shield, color: 'text-indigo-600', bg: 'bg-indigo-50', note: undefined },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {isDemo && (
        <div className="flex items-center gap-3 px-5 py-3 bg-amber-50 border border-amber-200 rounded-2xl w-fit">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Demo Data — Your live metrics will appear once transactions begin</p>
        </div>
      )}

      {/* AI Co-Pilot Insights */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Zap size={15} className="text-[#7851A9]" />
          <p className="text-xs font-black uppercase tracking-[0.2em] text-black">AI Co-Pilot Insights</p>
          <span className="px-2.5 py-0.5 bg-[#7851A9]/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-[#7851A9]">Live Analysis</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {COPILOT_INSIGHTS.map((insight, i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-[1.5rem] p-5 hover:shadow-lg hover:border-[#CA9CE1]/40 transition-all group">
              <div className={`w-9 h-9 ${insight.bg} ${insight.color} rounded-xl flex items-center justify-center mb-4`}>
                <insight.icon size={17} />
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">{insight.label}</p>
              <p className="text-sm font-black text-black leading-snug mb-2">{insight.headline}</p>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-4">{insight.detail}</p>
              <button
                onClick={() => onOpenAdvisor?.(insight.query)}
                className="w-full py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-100 text-slate-400 group-hover:border-[#7851A9]/30 group-hover:text-[#7851A9] group-hover:bg-[#7851A9]/5 transition-all"
              >
                Explore with AI →
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {metricCards.map((card, idx) => (
          <div key={idx} className="bg-white p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className={`w-10 h-10 ${card.bg} ${card.color} rounded-xl flex items-center justify-center mb-4`}>
              <card.icon size={20} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.label}</p>
            <p className="text-2xl font-black italic mt-1">${(card.value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            {card.note && <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">{card.note}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        <div className="lg:col-span-2 bg-white p-4 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black italic uppercase tracking-tighter">Revenue Velocity (30D)</h3>
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${isDemo ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {isDemo ? 'Demo' : 'Live Data'}
              </span>
            </div>
          </div>
          <div className="h-48 sm:h-80">
            {activeChart.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeChart}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7851A9" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#7851A9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 800 }} 
                  tickFormatter={(val) => format(new Date(val), 'MMM d')}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800 }} hide={window.innerWidth < 640} />
                <Tooltip 
                  contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '1rem' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#7851A9" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
            )}
          </div>

        </div>

        <div className="bg-white p-4 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8">Recent Activity</h3>
          <div className="space-y-6">
            {activeTransactions.length === 0 ? (
              <p className="text-slate-400 text-sm italic py-12 text-center">No recent transactions.</p>
            ) : (
              activeTransactions.map((t, idx) => (
                <div key={idx} className="flex items-center gap-4 group">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${t.grossAmount > 0 ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white' : 'bg-slate-50 text-slate-400'}`}>
                    {t.grossAmount > 0 ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black truncate uppercase tracking-tight">{t.productService?.name || 'Platform Transaction'}</p>
                    <p className="text-[10px] font-medium text-slate-400">{format(new Date(t.createdAt), 'MMM d, h:mm a')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black italic">${t.grossAmount.toFixed(2)}</p>
                    <p className="text-[10px] font-black text-[#7851A9] uppercase">Net: ${t.merchantNet.toFixed(2)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <button className="w-full mt-8 py-4 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
            View All Transactions
          </button>
        </div>
      </div>
    </div>
  );
};
