
import { useState, useEffect } from 'react';
import { GovernanceProposal, User, ConsensusVote, WaivedFundLog } from '../types';
import { showToast } from './toast';

export function useGovernanceStore(currentUser: User | null, onUpdateUser: (u: User) => void) {
  const [proposals, setProposals] = useState<GovernanceProposal[]>([]);
  const [waivedFundsLog, setWaivedFundsLog] = useState<WaivedFundLog[]>([]);

  useEffect(() => {
    // Clean launch: governance starts EMPTY — no fabricated proposals or vote counts.
    // One-time purge of the legacy seeded proposals earlier builds wrote to localStorage.
    const GOV_SEED = 'clean-v1';
    if (localStorage.getItem('gc_governance_seed') !== GOV_SEED) {
      localStorage.removeItem('gc_governance_proposals');
      localStorage.setItem('gc_governance_seed', GOV_SEED);
    }

    const savedProposals = localStorage.getItem('gc_governance_proposals');
    if (savedProposals) setProposals(JSON.parse(savedProposals));

    const savedLog = localStorage.getItem('gc_waived_funds_log');
    if (savedLog) setWaivedFundsLog(JSON.parse(savedLog));
  }, []);

  const castVote = (proposalId: string, direction: 'FOR' | 'AGAINST') => {
    if (!currentUser) return;
    
    // Weighted Voting Logic: Weight = Impact Score
    const weight = currentUser.impactScore || 10;

    setProposals(prev => {
      const updated = prev.map(p => {
        if (p.id === proposalId) {
          const alreadyVoted = p.votes?.some(v => v.userId === currentUser.id);
          if (alreadyVoted) return p;

          const newVote: ConsensusVote = {
            userId: currentUser.id,
            weight,
            vote: direction,
            timestamp: new Date().toISOString()
          };

          return {
            ...p,
            votesFor: direction === 'FOR' ? p.votesFor + weight : p.votesFor,
            votesAgainst: direction === 'AGAINST' ? p.votesAgainst + weight : p.votesAgainst,
            votes: [...(p.votes || []), newVote]
          };
        }
        return p;
      });
      localStorage.setItem('gc_governance_proposals', JSON.stringify(updated));
      return updated;
    });
  };

  const createProposal = (data: Partial<GovernanceProposal>) => {
    if (!currentUser) return;
    const stake = data.stakeAmount || 100;
    
    if ((currentUser.impactPoints || 0) < stake) {
      showToast('Insufficient Impact Points to stake this proposal.', 'error');
      return;
    }

    const newProposal: GovernanceProposal = {
      id: `prop-${Date.now()}`,
      type: data.type || 'STREET_INITIATIVE',
      title: data.title || 'Untitled Proposal',
      description: data.description || '',
      proposerId: currentUser.id,
      proposerName: currentUser.name,
      stakeAmount: stake,
      votesFor: 0,
      votesAgainst: 0,
      status: 'VOTING',
      expiryDate: new Date(Date.now() + 86400000 * 7).toISOString(),
      consensusThreshold: 0.51,
      votes: []
    };

    // Subtract stake from user
    onUpdateUser({
      ...currentUser,
      impactPoints: (currentUser.impactPoints || 0) - stake
    });

    setProposals(prev => {
      const updated = [newProposal, ...prev];
      localStorage.setItem('gc_governance_proposals', JSON.stringify(updated));
      return updated;
    });
  };

  const logWaivedFunds = (log: Omit<WaivedFundLog, 'id' | 'timestamp'>) => {
    const newLog: WaivedFundLog = {
      ...log,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    setWaivedFundsLog(prev => {
      const updated = [newLog, ...prev];
      localStorage.setItem('gc_waived_funds_log', JSON.stringify(updated));
      return updated;
    });
  };

  return {
    proposals,
    waivedFundsLog,
    castVote,
    createProposal,
    logWaivedFunds
  };
}
