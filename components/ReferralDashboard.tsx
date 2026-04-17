import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Share2, Users, Trophy, DollarSign, Copy, CheckCircle } from 'lucide-react';

interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  activeReferrals: number;
  totalBonusesEarned: number;
  payouts: any[];
}

export const ReferralDashboard: React.FC = () => {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/nonprofit/referral-code', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      // For now, we'll mock the stats part as we don't have a full stats API yet
      // but we'll get the real referral code
      setStats({
        referralCode: data.referralCode,
        totalReferrals: 0,
        activeReferrals: 0,
        totalBonusesEarned: 0,
        payouts: []
      });
    } catch (err) {
      console.error('Failed to fetch referral stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (stats?.referralCode) {
      navigator.clipboard.writeText(stats.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return <div className="p-8 text-center text-zinc-500">Loading referral dashboard...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Merchant Referral Program</h1>
        <p className="text-zinc-500">Earn bonuses by recruiting merchants to the Good Circles platform.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Referral Code Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-emerald-600">
              <Share2 className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Your Referral Code</h2>
            </div>
            <p className="text-zinc-600">
              Share this code with merchants during their registration. When they reach funding milestones, you earn bonuses!
            </p>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex-1 bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-xl p-4 text-center">
              <span className="text-2xl font-mono font-bold tracking-widest text-zinc-800">
                {stats?.referralCode}
              </span>
            </div>
            <button 
              onClick={copyToClipboard}
              className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-4 rounded-xl font-medium hover:bg-zinc-800 transition-colors"
            >
              {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-zinc-900">{stats?.totalReferrals}</span>
            </div>
            <p className="mt-4 text-sm font-medium text-zinc-500 uppercase tracking-wider">Total Referrals</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <DollarSign className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-zinc-900">${stats?.totalBonusesEarned}</span>
            </div>
            <p className="mt-4 text-sm font-medium text-zinc-500 uppercase tracking-wider">Bonuses Earned</p>
          </motion.div>
        </div>
      </div>

      {/* Bonus Tiers Info */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-zinc-900">
          <Trophy className="w-6 h-6 text-amber-500" />
          <h2 className="text-2xl font-bold">Bonus Tiers</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'Activation', threshold: '$7,500', bonus: '$500' },
            { name: 'Established', threshold: '$25,000', bonus: '$1,000' },
            { name: 'High Volume', threshold: '$75,000', bonus: '$2,500' },
            { name: 'Anchor Merchant', threshold: '$150,000', bonus: '$5,000' },
          ].map((tier, i) => (
            <div key={i} className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 space-y-2">
              <h3 className="font-bold text-zinc-900">{tier.name}</h3>
              <p className="text-sm text-zinc-500">Threshold: {tier.threshold}</p>
              <div className="pt-2">
                <span className="text-xl font-bold text-emerald-600">{tier.bonus}</span>
                <span className="text-xs text-zinc-400 ml-1">bonus</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Referral History (Placeholder) */}
      <section className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-zinc-200">
          <h2 className="text-xl font-bold text-zinc-900">Referral History</h2>
        </div>
        <div className="p-12 text-center space-y-4">
          <div className="inline-flex p-4 bg-zinc-50 rounded-full text-zinc-400">
            <Users className="w-8 h-8" />
          </div>
          <p className="text-zinc-500">No referrals yet. Start sharing your code to earn bonuses!</p>
        </div>
      </section>
    </div>
  );
};
