
import { useState, useEffect } from 'react';
import { GovernanceProposal, User, ConsensusVote, WaivedFundLog } from '../types';

export function useGovernanceStore(currentUser: User | null, onUpdateUser: (u: User) => void) {
  const [proposals, setProposals] = useState<GovernanceProposal[]>([]);
  const [waivedFundsLog, setWaivedFundsLog] = useState<WaivedFundLog[]>([]);

  useEffect(() => {
    const savedProposals = localStorage.getItem('gc_governance_proposals');
    const savedLog = localStorage.getItem('gc_waived_funds_log');

    if (savedProposals) {
      setProposals(JSON.parse(savedProposals));
    } else {
      const initial: GovernanceProposal[] = [
        {
          id: 'prop-constit-1',
          type: 'RATE_ADJUSTMENT',
          title: 'Emergency Grocery Support Rate',
          description: 'Proposed decrease in Grocery platform fee to 0.25% for the winter season to lower staple costs.',
          proposerId: 'u-admin',
          proposerName: 'Economic Steward',
          stakeAmount: 500,
          votesFor: 850,
          votesAgainst: 120,
          status: 'VOTING',
          expiryDate: new Date(Date.now() + 86400000 * 5).toISOString(),
          consensusThreshold: 0.60,
          votes: []
        },
        {
          id: 'prop-init-2',
          type: 'STREET_INITIATIVE',
          title: 'Main St. Modular Planters',
          description: 'Allocating $2k from the regional common fund for high-velocity street beautification.',
          proposerId: 'neighbor-1',
          proposerName: 'Community Lead',
          stakeAmount: 200,
          votesFor: 2100,
          votesAgainst: 50,
          status: 'PASSED',
          expiryDate: new Date(Date.now() - 86400000).toISOString(),
          consensusThreshold: 0.51,
          votes: []
        }
      ];
      setProposals(initial);
      localStorage.setItem('gc_governance_proposals', JSON.stringify(initial));
    }

    if (savedLog) {
      setWaivedFundsLog(JSON.parse(savedLog));
    }
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
      alert("Insufficient Impact Points to stake this proposal.");
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
