import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { type Role } from './lib/brand';
import { getWaitlistCount } from './lib/api';

import Nav from './components/Nav';
import Hero from './sections/Hero';
import RoleMirror from './sections/RoleMirror';
import NeighborStory from './sections/stories/NeighborStory';
import MerchantStory from './sections/stories/MerchantStory';
import NonprofitStory from './sections/stories/NonprofitStory';
import CdfiMunicipalStory from './sections/stories/CdfiMunicipalStory';
import Confirmation from './sections/Confirmation';
import FAQ from './sections/FAQ';
import Footer from './sections/Footer';

export type Phase =
  | 'hero'
  | `story:${Role}`
  | 'confirmation';

export interface ConfirmationData {
  position:   number;
  inviteCode: string;
  role:       Role;
  email:      string;
}

export default function App() {
  const [phase, setPhase]           = useState<Phase>('hero');
  const [liveCount, setLiveCount]   = useState(2847);
  const [confirmation, setConfirmation] = useState<ConfirmationData | null>(null);

  useEffect(() => {
    getWaitlistCount().then(setLiveCount);
  }, []);

  const selectedRole: Role | null =
    phase.startsWith('story:') ? (phase.slice(6) as Role) : null;

  function handleRoleSelect(role: Role) {
    setPhase(`story:${role}`);
    setTimeout(() => {
      document.getElementById('story-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  function handleConfirm(data: ConfirmationData) {
    setConfirmation(data);
    setLiveCount(c => c + 1);
    // Scroll to top for full-page confirmation feel
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Brief delay then swap to confirmation
    setTimeout(() => setPhase('confirmation'), 300);
  }

  function handleBack() {
    setPhase('hero');
    setTimeout(() => {
      document.getElementById('mirror-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  return (
    <div className="min-h-screen bg-white">
      <Nav onHoldMySpot={() => {
        document.getElementById('mirror-section')?.scrollIntoView({ behavior: 'smooth' });
      }} />

      <AnimatePresence mode="wait">
        {phase === 'confirmation' && confirmation ? (
          <motion.div
            key="confirmation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Confirmation data={confirmation} />
          </motion.div>
        ) : (
          <motion.div key="main" initial={{ opacity: 1 }} animate={{ opacity: 1 }}>
            {/* Hero — always visible */}
            <Hero liveCount={liveCount} />

            {/* Mirror or Story — swaps in place */}
            <div id="mirror-section">
              <AnimatePresence mode="wait">
                {selectedRole ? (
                  <motion.div
                    key={`story-${selectedRole}`}
                    id="story-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {selectedRole === 'NEIGHBOR'  && <NeighborStory    onConfirm={handleConfirm} onBack={handleBack} />}
                    {selectedRole === 'MERCHANT'  && <MerchantStory    onConfirm={handleConfirm} onBack={handleBack} />}
                    {selectedRole === 'NONPROFIT' && <NonprofitStory   onConfirm={handleConfirm} onBack={handleBack} />}
                    {(selectedRole === 'CDFI' || selectedRole === 'MUNICIPAL') && (
                      <CdfiMunicipalStory role={selectedRole} onConfirm={handleConfirm} onBack={handleBack} />
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="mirror"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <RoleMirror onSelect={handleRoleSelect} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <FAQ />
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
