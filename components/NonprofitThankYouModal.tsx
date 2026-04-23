import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, X } from 'lucide-react';

export interface ThankYouMilestone {
  amount: number;
  label: string;
  realWorldEquivalent: string;
  nonprofitName: string;
  nonprofitMission: string;
  directorMessage: string;
  directorName: string;
  directorTitle: string;
}

const MILESTONE_THRESHOLDS = [10, 25, 50, 100, 250, 500, 1000];

const NONPROFIT_MESSAGES: Record<string, { director: string; title: string; messages: Record<number, { message: string; equivalent: string }> }> = {
  default: {
    director: 'Community Director',
    title: 'Executive Director',
    messages: {
      10:  { message: 'Every dollar counts. Your support has already touched lives in our community — thank you for choosing to shop with purpose.', equivalent: '25 meals for a family in need' },
      25:  { message: 'You\'ve reached your first major milestone! Because of shoppers like you, we can plan further into the future and serve more families every week.', equivalent: 'A week of after-school programs' },
      50:  { message: 'Fifty dollars is more than a number — it\'s a statement that you believe in the power of community commerce. Our whole team is grateful.', equivalent: 'A medical supply kit for a local family' },
      100: { message: 'One hundred dollars generated through everyday shopping. This is what GoodCircles was built for — and you\'re living proof it works. Thank you.', equivalent: 'A month of community programming' },
      250: { message: 'You\'ve become one of our most impactful community supporters without writing a single check. The way you shop has changed lives. We\'re honored.', equivalent: 'Full funding for a community workshop series' },
      500: { message: 'Five hundred dollars raised through commerce, not charity. You are the model this community was designed around. From our entire team — thank you.', equivalent: 'Sponsoring a full month of services' },
      1000: { message: 'One thousand dollars. Through your everyday purchases, you\'ve funded more than most annual donors give. You are a pillar of this community.', equivalent: 'Funding a quarter of annual operations' },
    },
  },
  'Community Food Bank': {
    director: 'Marcus Webb',
    title: 'Executive Director, Community Food Bank',
    messages: {
      10:  { message: 'Ten dollars doesn\'t sound like much, but in our pantry, it means 25 meals. Thank you for making sure our neighbors don\'t go to bed hungry.', equivalent: '25 meals for local families' },
      25:  { message: 'Because of your shopping choices, 62 people ate this week who might not have otherwise. That\'s not a statistic — those are our neighbors. Thank you.', equivalent: '62 meals for community members' },
      50:  { message: 'Fifty dollars means our volunteers can stock a full shelf of essentials this Saturday. You\'re part of our team now, whether you know it or not.', equivalent: 'A fully stocked pantry shelf' },
      100: { message: 'One hundred dollars buys groceries for an entire family for two weeks. Through your everyday purchases, you\'ve kept a family fed. That is extraordinary.', equivalent: '2 weeks of groceries for a family of 4' },
      250: { message: 'You\'ve now funded five full food distributions. Families who lined up on those Saturdays don\'t know your name — but they felt your generosity. Thank you.', equivalent: '5 complete family food distributions' },
      500: { message: 'Five hundred dollars. That\'s our operating budget for a full week. Because you chose to shop local, we kept our doors open and our shelves stocked. We are grateful beyond words.', equivalent: 'One full week of Food Bank operations' },
      1000: { message: 'A thousand dollars raised through commerce. That\'s three months of our utility costs, or 2,500 meals. You\'ve become one of our most impactful supporters. Thank you from every family we serve.', equivalent: '2,500 meals for community members' },
    },
  },
  'Youth Scholars Alliance': {
    director: 'Dr. Patricia Okafor',
    title: 'Founder, Youth Scholars Alliance',
    messages: {
      10:  { message: 'Ten dollars buys pencils, notebooks, and hope for a student who doesn\'t have them at home. Your shopping just changed someone\'s school day. Thank you.', equivalent: 'School supplies for one student' },
      25:  { message: 'Twenty-five dollars funds a full week of after-school tutoring for a student who is falling behind. Because of you, they got to stay. Thank you.', equivalent: 'One week of after-school tutoring' },
      50:  { message: 'Fifty dollars covers the registration fee for a student whose family couldn\'t afford a summer enrichment program. You just opened a door that was closed. Thank you.', equivalent: 'Summer program registration for one student' },
      100: { message: 'One hundred dollars funds a month of mentorship sessions for a high schooler preparing for college applications. You may have just changed their trajectory. Thank you.', equivalent: 'One month of college prep mentorship' },
      250: { message: 'You\'ve funded a full scholarship to our spring academic intensive program. That student will carry what they learn for the rest of their life — and they have you to thank.', equivalent: 'Full academic intensive scholarship' },
      500: { message: 'Five hundred dollars underwrites our entire workshop series for a semester. Because of your shopping habits, twenty students received education they couldn\'t access before. Thank you.', equivalent: 'A full semester workshop series for 20 students' },
      1000: { message: 'A thousand dollars. That\'s our annual technology fund — the laptops and software that make remote learning possible for students who don\'t have devices at home. You made that happen through everyday commerce. We are deeply grateful.', equivalent: 'Annual technology fund for our student cohort' },
    },
  },
  'Green Cleanup Initiative': {
    director: 'James Tillery',
    title: 'Director of Operations, Green Cleanup Initiative',
    messages: {
      10:  { message: 'Ten dollars equips one volunteer with gloves, bags, and safety gear for a full cleanup day. Because of you, our waterways are a little cleaner today.', equivalent: 'Gear for one cleanup volunteer' },
      25:  { message: 'Twenty-five dollars plants five native trees in neighborhoods that have been without green space for decades. Those trees will outlive all of us. Thank you.', equivalent: '5 native trees planted in the community' },
      50:  { message: 'Fifty dollars funds a community cleanup event from start to finish — volunteers, equipment, and safe disposal. You just restored something beautiful to our city.', equivalent: 'One complete neighborhood cleanup event' },
      100: { message: 'One hundred dollars covers a month of water quality testing in three local waterways. Because of you, we know what\'s in the water our community drinks. That knowledge is power.', equivalent: 'One month of water quality monitoring' },
      250: { message: 'Two hundred fifty dollars funds our quarterly environmental education session for two elementary schools. Those kids will grow up knowing the land is worth protecting — because of you.', equivalent: 'Environmental education for 2 elementary schools' },
      500: { message: 'Five hundred dollars underwrites our annual watershed restoration project. Miles of riverbank will be cleared, replanted, and monitored — all because you chose to shop local.', equivalent: 'Annual watershed restoration project' },
      1000: { message: 'A thousand dollars. That\'s our entire equipment budget for the year — the tools that make every cleanup possible. Through everyday commerce, you\'ve equipped an army of environmental stewards. Thank you.', equivalent: 'Annual equipment fund for all cleanup operations' },
    },
  },
};

export function getNextMilestone(current: number, added: number): number | null {
  const newTotal = current + added;
  for (const threshold of MILESTONE_THRESHOLDS) {
    if (current < threshold && newTotal >= threshold) return threshold;
  }
  return null;
}

interface Props {
  isVisible: boolean;
  onClose: () => void;
  milestone: number;
  nonprofitName: string;
  nonprofitMission: string;
  lifetimeTotal: number;
}

export const NonprofitThankYouModal: React.FC<Props> = ({
  isVisible, onClose, milestone, nonprofitName, nonprofitMission, lifetimeTotal,
}) => {
  const npoData = NONPROFIT_MESSAGES[nonprofitName] ?? NONPROFIT_MESSAGES['default'];
  const milestoneData = npoData.messages[milestone] ?? npoData.messages[Object.keys(npoData.messages).map(Number).sort((a, b) => b - a).find(k => k <= milestone) ?? 10];

  useEffect(() => {
    if (!isVisible) return;
    const t = setTimeout(onClose, 12000);
    return () => clearTimeout(t);
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[300] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            className="relative max-w-md w-full"
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          >
            {/* Glow */}
            <div className="absolute -inset-4 bg-[#C2A76F]/20 rounded-[4rem] blur-2xl" />

            <div className="relative bg-[#0D0D12] rounded-[2.5rem] overflow-hidden border border-[#C2A76F]/20 shadow-2xl">
              {/* Top accent bar */}
              <div className="h-1 bg-gradient-to-r from-[#C2A76F] via-[#7851A9] to-[#C2A76F]" />

              {/* Dismiss */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors z-10"
              >
                <X size={14} className="text-white/60" />
              </button>

              <div className="p-7 space-y-5">
                {/* Milestone badge */}
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-12 h-12 rounded-2xl bg-[#C2A76F]/20 flex items-center justify-center flex-shrink-0"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  >
                    <Heart size={22} className="text-[#C2A76F]" fill="#C2A76F" />
                  </motion.div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <Sparkles size={12} className="text-[#C2A76F]" />
                      <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#C2A76F]">Impact Milestone Reached</p>
                    </div>
                    <p className="text-2xl font-black italic text-white">${milestone.toLocaleString()} Generated</p>
                  </div>
                </div>

                {/* Nonprofit + director */}
                <div className="border-t border-white/10 pt-5 space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40">A message from</p>
                  <p className="text-base font-black italic uppercase tracking-tight text-white">{nonprofitName}</p>
                  <p className="text-[10px] text-white/40 font-medium">{nonprofitMission}</p>
                </div>

                {/* Director message */}
                <blockquote className="text-sm text-white/80 font-medium leading-relaxed italic border-l-2 border-[#C2A76F]/40 pl-4">
                  "{milestoneData.message}"
                </blockquote>

                {/* Attribution */}
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                  — {npoData.director}, {npoData.title}
                </p>

                {/* Real world equivalent */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#C2A76F] mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">What This Means</p>
                    <p className="text-sm font-black text-white/90">{milestoneData.equivalent}</p>
                  </div>
                </div>

                {/* Lifetime total */}
                <div className="flex items-center justify-between pt-1 border-t border-white/10">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Your Lifetime Impact</p>
                  <p className="text-sm font-black italic text-[#C2A76F]">${lifetimeTotal.toFixed(2)} total</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
