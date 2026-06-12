import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { type Role } from '../../lib/brand';
import { trackSignup } from '../../lib/analytics';
import type { ConfirmationData } from './types';

import RoleMirror from './RoleMirror';
import NeighborStory from './stories/NeighborStory';
import MerchantStory from './stories/MerchantStory';
import NonprofitStory from './stories/NonprofitStory';
import CdfiStory from './stories/CdfiStory';
import MunicipalStory from './stories/MunicipalStory';
import Confirmation from './Confirmation';

// The interactive signup flow from the SPA's App.tsx, scoped to one island:
// role mirror → audience story + form → full-page confirmation. The static
// sections above (hero, demo) are hidden via body.gc-confirmed when the
// confirmation shows, preserving the SPA's full-page confirmation feel.
export default function RoleFlow() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [confirmation, setConfirmation] = useState<ConfirmationData | null>(null);

  function handleRoleSelect(role: Role) {
    setSelectedRole(role);
    setTimeout(() => {
      document.getElementById('story-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  function handleConfirm(data: ConfirmationData) {
    trackSignup(data.role, { overflow: data.overflow ?? false });
    setConfirmation(data);
    document.body.classList.add('gc-confirmed');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function handleBack() {
    setSelectedRole(null);
    setTimeout(() => {
      document.getElementById('mirror-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  if (confirmation) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <Confirmation data={confirmation} />
      </motion.div>
    );
  }

  return (
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
          {selectedRole === 'NEIGHBOR' && <NeighborStory onConfirm={handleConfirm} onBack={handleBack} />}
          {selectedRole === 'MERCHANT' && <MerchantStory onConfirm={handleConfirm} onBack={handleBack} />}
          {selectedRole === 'NONPROFIT' && <NonprofitStory onConfirm={handleConfirm} onBack={handleBack} />}
          {selectedRole === 'CDFI' && <CdfiStory onConfirm={handleConfirm} onBack={handleBack} />}
          {selectedRole === 'MUNICIPAL' && <MunicipalStory onConfirm={handleConfirm} onBack={handleBack} />}
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
  );
}
