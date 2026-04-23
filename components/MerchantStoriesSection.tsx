import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Quote, Store, Heart } from 'lucide-react';

interface MerchantStory {
  id: string;
  merchantName: string;
  ownerName: string;
  category: string;
  tagline: string;
  quote: string;
  joinReason: string;
  fullStory: string;
  impact: string;
  imageUrl: string;
  avatarUrl: string;
  accentColor: string;
}

const MERCHANT_STORIES: MerchantStory[] = [
  {
    id: 'harvest-table',
    merchantName: 'The Harvest Table',
    ownerName: 'Marco',
    category: 'Dining',
    tagline: 'Farm-to-table dining rooted in community.',
    quote: 'Every meal we serve funds something bigger than our bottom line.',
    joinReason: 'I wanted commerce that gave back to the community I grew up in.',
    fullStory:
      'I opened The Harvest Table to prove that local food can be both affordable and community-driven. Running a restaurant in Central Mississippi means you live and die by your neighborhood. When the neighborhood thrives, you thrive.\n\nWhen I discovered GoodCircles, I saw a platform that shared that same belief—every transaction could fund something bigger. In our first six months on the platform, we contributed over $4,200 to the Community Food Bank. That\'s not charity. That\'s commerce with a conscience.\n\nThe 10/10/1 model changed how I think about pricing. I used to compete on price alone. Now I compete on values, and my customers respect that. They come back not just for the food, but because they know their meal does something.',
    impact: '$4,200+ contributed to Community Food Bank',
    imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=500&fit=crop',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&facepad=2&faces=1',
    accentColor: '#C2A76F',
  },
  {
    id: 'fixit-local',
    merchantName: 'Fix-It Local',
    ownerName: 'Lisa',
    category: 'Home Services',
    tagline: 'Trusted plumbing that keeps the community flowing.',
    quote: 'I don\'t just get customers — I get neighbors who care where their money goes.',
    joinReason: 'I needed a way to compete with national chains while staying community-rooted.',
    fullStory:
      'Running a small plumbing business in Central Mississippi means competing against national chains with massive marketing budgets and zero local loyalty. For years, I felt like I was fighting with one hand tied behind my back.\n\nGoodCircles leveled the playing field in a way I didn\'t expect. Customers don\'t just choose me because I\'m local anymore—they choose me because every job I complete sends a donation to causes they care about. That\'s a story national chains can\'t tell.\n\nKnowing that every drain I unclog, every pipe I fix, generates funding for Youth Scholars Alliance—that keeps me going on the hard days. My work has meaning beyond the invoice. That\'s not something I ever thought I\'d say about plumbing.',
    impact: '$2,800+ directed to Youth Scholars Alliance',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&facepad=2&faces=1',
    accentColor: '#7851A9',
  },
  {
    id: 'justice-partners',
    merchantName: 'Justice Partners Legal',
    ownerName: 'David',
    category: 'Legal Services',
    tagline: 'Accessible legal counsel for every community member.',
    quote: 'Legal access shouldn\'t be a privilege. Neither should community impact.',
    joinReason: 'I wanted my business to extend my social justice mission beyond the courtroom.',
    fullStory:
      'I built Justice Partners because I watched too many people navigate the legal system alone—not because their case wasn\'t valid, but because they couldn\'t afford representation. Access to legal help shouldn\'t depend on your zip code or your income.\n\nGoodCircles gave us a way to extend that mission into every transaction. Every consultation we bill generates a donation to Green Cleanup Initiative. We\'re not just practicing law. We\'re practicing community.\n\nThe platform has also changed the conversation with clients. When I explain that their legal fee partly funds local environmental projects, it reframes the entire relationship. We\'re not just lawyer and client—we\'re partners in building something better together.',
    impact: '$3,500+ directed to Green Cleanup Initiative',
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=500&fit=crop',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&facepad=2&faces=1',
    accentColor: '#A20021',
  },
  {
    id: 'farm-fresh',
    merchantName: 'Farm Fresh Collective',
    ownerName: 'Sarah',
    category: 'Groceries',
    tagline: 'Eleven family farms. One community table.',
    quote: 'Local dollars keep family farms alive. GoodCircles gets that.',
    joinReason: 'The co-op model aligned perfectly with how our farming collective already operated.',
    fullStory:
      'Farm Fresh Collective represents eleven family farms across Central Mississippi. We\'ve operated as a cooperative for twelve years because we learned early that individual farms competing against each other made us all weaker. Pooling resources, sharing distribution, and presenting a unified brand made us stronger.\n\nWhen we found GoodCircles, we recognized ourselves in the platform. The co-op purchasing model, the shared economics, the community-first orientation—it\'s built from the same DNA as how we already operate.\n\nOur member farms have collectively generated over $6,800 in nonprofit contributions, just by selling the produce they\'d sell anyway. That\'s the power of aligned incentives. Every dollar that stays local is a dollar that keeps a farm family in business, and GoodCircles makes that tangible in a way we could never communicate before.',
    impact: '$6,800+ generated across 11 member farms',
    imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&h=500&fit=crop',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&facepad=2&faces=1',
    accentColor: '#34D399',
  },
  {
    id: 'tutorzone',
    merchantName: 'TutorZone Academy',
    ownerName: 'Alex',
    category: 'Education',
    tagline: 'Personalized learning that lifts the whole community.',
    quote: 'Every lesson I deliver now funds something greater than the grade.',
    joinReason: 'I wanted to amplify my social impact beyond the whiteboard.',
    fullStory:
      'I\'ve been a tutor for fifteen years. I got into education because I believe it\'s the most direct path to changing someone\'s life trajectory. A student who understands math doesn\'t just pass a test—they unlock opportunities that compound for decades.\n\nBut I never imagined that my tutoring sessions could also fund community nonprofits. With GoodCircles, every lesson I deliver generates 10% for a local cause. My students learn, the community benefits, and I get to run a business that fully reflects my values.\n\nParents often ask me why I chose GoodCircles over other platforms. I tell them: because I want my business to mean something beyond the invoice. When a student I tutored gets into college, I know our sessions didn\'t just help them—they helped the community that will welcome them back.',
    impact: '$1,900+ directed to local nonprofits',
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=500&fit=crop',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&facepad=2&faces=1',
    accentColor: '#7851A9',
  },
];

interface StoryModalProps {
  story: MerchantStory;
  onClose: () => void;
}

const StoryModal: React.FC<StoryModalProps> = ({ story, onClose }) => (
  <AnimatePresence>
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative bg-white rounded-[2rem] sm:rounded-[3rem] overflow-hidden max-w-2xl w-full shadow-2xl max-h-[90vh] flex flex-col"
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Hero image */}
        <div className="relative h-48 sm:h-64 flex-shrink-0">
          <img src={story.imageUrl} alt={story.merchantName} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/40 transition-colors"
          >
            <X size={18} className="text-white" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end gap-4">
            <img
              src={story.avatarUrl}
              alt={story.ownerName}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-lg flex-shrink-0"
            />
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg mb-1" style={{ backgroundColor: story.accentColor + '33' }}>
                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: story.accentColor }}>{story.category}</span>
              </div>
              <h3 className="text-xl font-black italic uppercase tracking-tighter text-white leading-tight">{story.merchantName}</h3>
              <p className="text-xs text-white/70 font-medium">Founded by {story.ownerName}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 sm:p-8 space-y-6">
          {/* Pull quote */}
          <div className="flex gap-3">
            <Quote size={20} className="flex-shrink-0 mt-1" style={{ color: story.accentColor }} />
            <p className="text-lg sm:text-xl font-black italic text-black leading-snug">"{story.quote}"</p>
          </div>

          {/* Why I joined */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Why I Joined GoodCircles</p>
            <p className="text-sm font-medium text-slate-700 italic">"{story.joinReason}"</p>
          </div>

          {/* Full story */}
          <div className="space-y-4">
            {story.fullStory.split('\n\n').map((paragraph, i) => (
              <p key={i} className="text-sm text-slate-600 font-medium leading-relaxed">{paragraph}</p>
            ))}
          </div>

          {/* Impact badge */}
          <div className="flex items-center gap-3 p-4 rounded-2xl border" style={{ borderColor: story.accentColor + '40', backgroundColor: story.accentColor + '10' }}>
            <Heart size={16} style={{ color: story.accentColor }} />
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Community Impact</p>
              <p className="text-sm font-black" style={{ color: story.accentColor }}>{story.impact}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

export const MerchantStoriesSection: React.FC = () => {
  const [activeStory, setActiveStory] = useState<MerchantStory | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'right' ? 320 : -320, behavior: 'smooth' });
  };

  return (
    <>
      <div className="space-y-6">
        {/* Section header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Store size={16} className="text-[#7851A9]" />
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-black">Meet Our Merchants</h3>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Real stories from the community builders behind every listing</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-9 h-9 rounded-xl border border-slate-100 flex items-center justify-center hover:border-[#7851A9]/30 hover:bg-[#7851A9]/5 transition-all"
            >
              <ChevronLeft size={16} className="text-slate-400" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-9 h-9 rounded-xl border border-slate-100 flex items-center justify-center hover:border-[#7851A9]/30 hover:bg-[#7851A9]/5 transition-all"
            >
              <ChevronRight size={16} className="text-slate-400" />
            </button>
          </div>
        </div>

        {/* Scrollable cards */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {MERCHANT_STORIES.map(story => (
            <motion.div
              key={story.id}
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => setActiveStory(story)}
              className="flex-shrink-0 w-72 bg-white rounded-[2rem] border border-[#CA9CE1]/20 overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-200 group"
            >
              {/* Image */}
              <div className="relative h-40 overflow-hidden">
                <img
                  src={story.imageUrl}
                  alt={story.merchantName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                {/* Category badge */}
                <div
                  className="absolute top-3 left-3 px-2.5 py-1 rounded-lg"
                  style={{ backgroundColor: story.accentColor + '33' }}
                >
                  <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: story.accentColor }}>{story.category}</span>
                </div>
                {/* Avatar */}
                <img
                  src={story.avatarUrl}
                  alt={story.ownerName}
                  className="absolute bottom-3 right-3 w-10 h-10 rounded-xl object-cover border-2 border-white shadow-md"
                />
              </div>

              {/* Content */}
              <div className="p-5 space-y-3">
                <div>
                  <h4 className="text-base font-black italic uppercase tracking-tighter text-black leading-tight">{story.merchantName}</h4>
                  <p className="text-[10px] text-slate-400 font-medium">by {story.ownerName}</p>
                </div>

                {/* Quote */}
                <div className="flex gap-2">
                  <Quote size={12} className="flex-shrink-0 mt-0.5" style={{ color: story.accentColor }} />
                  <p className="text-xs text-slate-600 italic font-medium leading-snug line-clamp-2">"{story.quote}"</p>
                </div>

                {/* Impact */}
                <div className="flex items-center gap-2 pt-1">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: story.accentColor }} />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide">{story.impact}</p>
                </div>

                {/* CTA */}
                <button className="w-full mt-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 text-slate-500 group-hover:border-[#7851A9]/30 group-hover:text-[#7851A9] group-hover:bg-[#7851A9]/5 transition-all">
                  Read Their Story →
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Story modal */}
      {activeStory && (
        <StoryModal story={activeStory} onClose={() => setActiveStory(null)} />
      )}
    </>
  );
};
