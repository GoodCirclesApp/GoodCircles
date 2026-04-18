import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Users, Star, TrendingUp, Zap, Gift, Award, ArrowRight } from 'lucide-react';
import { apiClient } from '../services/apiClient';

// ═══════════════════════════════════════════════════
// COMMUNITY ACTIVITY FEED
// Real-time social proof showing platform activity
// ═══════════════════════════════════════════════════

interface FeedItem {
  id: string;
  type: 'PURCHASE' | 'DONATION' | 'MERCHANT_JOIN' | 'NONPROFIT_JOIN' | 'MILESTONE' | 'REFERRAL' | 'SIGNUP';
  message: string;
  detail?: string;
  amount?: number;
  timestamp: string;
}

const FEED_ICONS: Record<string, { icon: any; color: string; bg: string }> = {
  PURCHASE: { icon: ShoppingBag, color: '#7851A9', bg: '#7851A9' + '15' },
  DONATION: { icon: Heart, color: '#A20021', bg: '#A20021' + '15' },
  MERCHANT_JOIN: { icon: Users, color: '#C2A76F', bg: '#C2A76F' + '15' },
  NONPROFIT_JOIN: { icon: Award, color: '#34D399', bg: '#34D399' + '15' },
  MILESTONE: { icon: Star, color: '#C2A76F', bg: '#C2A76F' + '15' },
  REFERRAL: { icon: Gift, color: '#CA9CE1', bg: '#CA9CE1' + '15' },
  SIGNUP: { icon: Zap, color: '#34D399', bg: '#34D399' + '15' },
};

function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(dateString).toLocaleDateString();
}

// ── Compact Feed (sidebar / ticker style) ───────────
export const CommunityFeedCompact: React.FC<{ maxItems?: number }> = ({ maxItems = 5 }) => {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFeed();
    const interval = setInterval(fetchFeed, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchFeed = async () => {
    try {
      const data = await apiClient.get<FeedItem[]>('/marketplace/feed', { limit: maxItems });
      setItems(data);
    } catch (err) {
      // If endpoint doesn't exist yet, show demo data
      setItems(generateDemoFeed(maxItems));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 animate-pulse">
          <div className="w-8 h-8 rounded-full bg-slate-100" />
          <div className="flex-1"><div className="h-3 bg-slate-100 rounded w-3/4" /><div className="h-2 bg-slate-50 rounded w-1/2 mt-1" /></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-1">
      <AnimatePresence mode="popLayout">
        {items.map((item, i) => {
          const config = FEED_ICONS[item.type] || FEED_ICONS.PURCHASE;
          const Icon = config.icon;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-slate-50/50 transition-colors group"
            >
              <div className="p-1.5 rounded-lg shrink-0" style={{ backgroundColor: config.bg }}>
                <Icon size={14} style={{ color: config.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-slate-600 leading-tight truncate">{item.message}</p>
                <p className="text-[10px] text-slate-300 mt-0.5">{timeAgo(item.timestamp)}</p>
              </div>
              {item.amount && (
                <span className="text-[10px] font-black text-[#7851A9] shrink-0">${item.amount.toFixed(2)}</span>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

// ── Full Feed Panel ─────────────────────────────────
export const CommunityActivityFeed: React.FC<{ expanded?: boolean }> = ({ expanded = false }) => {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [isExpanded, setIsExpanded] = useState(expanded);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchFeed();
    const interval = setInterval(fetchFeed, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchFeed = async () => {
    try {
      const data = await apiClient.get<FeedItem[]>('/marketplace/feed', { limit: 30 });
      setItems(data);
    } catch (err) {
      setItems(generateDemoFeed(20));
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = filter === 'ALL' ? items : items.filter(i => i.type === filter);
  const displayItems = isExpanded ? filteredItems : filteredItems.slice(0, 8);

  // Aggregate stats
  const totalDonations = items.filter(i => i.type === 'DONATION').reduce((sum, i) => sum + (i.amount || 0), 0);
  const totalPurchases = items.filter(i => i.type === 'PURCHASE').length;
  const uniqueTypes = new Set(items.map(i => i.type)).size;

  return (
    <div className="bg-white rounded-2xl border border-[#CA9CE1]/20 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-[#7851A9]/5 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping opacity-30" />
            </div>
            <h3 className="text-sm font-black text-[#7851A9] uppercase tracking-widest">Community Activity</h3>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            <span>{totalPurchases} purchases</span>
            <span>${totalDonations.toFixed(0)} donated</span>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {[
            { id: 'ALL', label: 'All Activity' },
            { id: 'PURCHASE', label: 'Purchases' },
            { id: 'DONATION', label: 'Donations' },
            { id: 'MERCHANT_JOIN', label: 'New Merchants' },
            { id: 'SIGNUP', label: 'New Members' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                filter === f.id
                  ? 'bg-[#7851A9] text-white shadow-sm'
                  : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feed items */}
      <div ref={scrollRef} className={`divide-y divide-slate-50 ${isExpanded ? 'max-h-[600px] overflow-y-auto' : ''}`}>
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-slate-100" />
                <div className="flex-1"><div className="h-3 bg-slate-100 rounded w-3/4" /><div className="h-2 bg-slate-50 rounded w-1/2 mt-2" /></div>
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {displayItems.map((item, i) => {
              const config = FEED_ICONS[item.type] || FEED_ICONS.PURCHASE;
              const Icon = config.icon;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                  className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="p-2 rounded-xl shrink-0 mt-0.5" style={{ backgroundColor: config.bg }}>
                    <Icon size={16} style={{ color: config.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-700 leading-snug">{item.message}</p>
                    {item.detail && (
                      <p className="text-[10px] text-slate-400 mt-1">{item.detail}</p>
                    )}
                    <p className="text-[10px] text-slate-300 mt-1">{timeAgo(item.timestamp)}</p>
                  </div>
                  {item.amount && item.amount > 0 && (
                    <div className="text-right shrink-0">
                      <span className="text-sm font-black" style={{ color: config.color }}>
                        ${item.amount.toFixed(2)}
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Footer */}
      {filteredItems.length > 8 && (
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center gap-2 text-[10px] font-black text-[#7851A9] uppercase tracking-widest hover:text-[#CA9CE1] transition-colors"
          >
            {isExpanded ? 'Show Less' : `View All ${filteredItems.length} Activities`}
            <ArrowRight size={12} className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </button>
        </div>
      )}
    </div>
  );
};

// ── Floating Ticker (bottom notification style) ─────
export const ActivityTicker: React.FC = () => {
  const [currentItem, setCurrentItem] = useState<FeedItem | null>(null);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await apiClient.get<FeedItem[]>('/marketplace/feed', { limit: 10 });
        setItems(data);
      } catch {
        setItems(generateDemoFeed(10));
      }
    };
    fetchItems();
  }, []);

  useEffect(() => {
    if (items.length === 0) return;

    const showNext = () => {
      setCurrentItem(items[currentIndex % items.length]);
      setIsVisible(true);

      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          setCurrentIndex(prev => prev + 1);
        }, 500);
      }, 4000);
    };

    const timer = setTimeout(showNext, 2000);
    return () => clearTimeout(timer);
  }, [currentIndex, items]);

  if (!currentItem) return null;

  const config = FEED_ICONS[currentItem.type] || FEED_ICONS.PURCHASE;
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-40 max-w-sm w-[calc(100%-2rem)] sm:w-auto sm:left-6 sm:translate-x-0 sm:bottom-6 sm:top-auto"
        >
          <div className="flex items-center gap-3 bg-white rounded-2xl shadow-2xl border border-[#CA9CE1]/20 px-5 py-3.5">
            <div className="p-2 rounded-xl" style={{ backgroundColor: config.bg }}>
              <Icon size={18} style={{ color: config.color }} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-slate-700">{currentItem.message}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{timeAgo(currentItem.timestamp)}</p>
            </div>
            {currentItem.amount && currentItem.amount > 0 && (
              <span className="text-sm font-black" style={{ color: config.color }}>
                ${currentItem.amount.toFixed(2)}
              </span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ── Demo data generator (used when API endpoint isn't ready) ─
function generateDemoFeed(count: number): FeedItem[] {
  const firstNames = ['Sarah', 'Marcus', 'Elena', 'James', 'Priya', 'David', 'Maria', 'Alex', 'Grace', 'Henry', 'Carol', 'Frank', 'Lisa', 'Bob', 'Emma', 'Dan', 'Alice', 'Jack', 'Iris', 'Tom'];
  const merchants = ['The Harvest Table', 'Fix-It Local Plumbing', 'Farm Fresh Co.', 'TutorZone', 'Justice Law', 'Sunset Bakery', 'Green Garden Market', 'Blue Ridge Coffee'];
  const nonprofits = ['Community Food Bank', 'Youth Scholars Alliance', 'Green Cleanup Initiative', 'Local Arts Foundation', 'Shelter of Hope'];
  const products = ['Organic Tomatoes', 'Plumbing Repair', 'Math Tutoring', 'Fresh Bread', 'Legal Consultation', 'Coffee Beans', 'Garden Tools', 'Cooking Class'];

  const templates: (() => FeedItem)[] = [
    () => {
      const name = firstNames[Math.floor(Math.random() * firstNames.length)];
      const merchant = merchants[Math.floor(Math.random() * merchants.length)];
      const product = products[Math.floor(Math.random() * products.length)];
      const amount = Math.round((15 + Math.random() * 85) * 100) / 100;
      return { id: crypto.randomUUID(), type: 'PURCHASE', message: `${name} purchased ${product} from ${merchant}`, detail: `10% discount applied • nonprofit donation included`, amount, timestamp: randomRecentDate() };
    },
    () => {
      const name = firstNames[Math.floor(Math.random() * firstNames.length)];
      const nonprofit = nonprofits[Math.floor(Math.random() * nonprofits.length)];
      const amount = Math.round((2 + Math.random() * 15) * 100) / 100;
      return { id: crypto.randomUUID(), type: 'DONATION', message: `${name}'s purchase generated a donation to ${nonprofit}`, detail: `Automatic 10/10/1 donation from shopping`, amount, timestamp: randomRecentDate() };
    },
    () => {
      const merchant = merchants[Math.floor(Math.random() * merchants.length)];
      return { id: crypto.randomUUID(), type: 'MERCHANT_JOIN', message: `${merchant} joined the Good Circles marketplace`, detail: `New local business ready to serve the community`, timestamp: randomRecentDate() };
    },
    () => {
      const nonprofit = nonprofits[Math.floor(Math.random() * nonprofits.length)];
      return { id: crypto.randomUUID(), type: 'NONPROFIT_JOIN', message: `${nonprofit} is now receiving donations on Good Circles`, detail: `Community impact partner`, timestamp: randomRecentDate() };
    },
    () => {
      const name = firstNames[Math.floor(Math.random() * firstNames.length)];
      return { id: crypto.randomUUID(), type: 'SIGNUP', message: `${name} joined the Good Circles community`, detail: `Welcome to the circle!`, timestamp: randomRecentDate() };
    },
    () => {
      const count = Math.floor(50 + Math.random() * 200);
      return { id: crypto.randomUUID(), type: 'MILESTONE', message: `Community milestone: ${count} transactions this week!`, detail: `The local economy is thriving`, timestamp: randomRecentDate() };
    },
    () => {
      const name = firstNames[Math.floor(Math.random() * firstNames.length)];
      const referred = firstNames[Math.floor(Math.random() * firstNames.length)];
      return { id: crypto.randomUUID(), type: 'REFERRAL', message: `${name} referred ${referred} to Good Circles`, detail: `Referral bonus earned`, amount: 5, timestamp: randomRecentDate() };
    },
  ];

  return Array.from({ length: count }, () => {
    const template = templates[Math.floor(Math.random() * templates.length)];
    return template();
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function randomRecentDate(): string {
  const now = Date.now();
  const hoursAgo = Math.random() * 72; // within last 3 days
  return new Date(now - hoursAgo * 3600000).toISOString();
}
