
import { useState, useEffect } from 'react';
import { CommunityProject, User } from '../types';
import { neighborService } from '../services/neighborService';
import { showToast } from './toast';

export function useProjectStore(currentUser: User | null, onUpdateUser: (u: User) => void) {
  const [projects, setProjects] = useState<CommunityProject[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchInitiatives();
  }, []);

  const fetchInitiatives = async () => {
    setIsLoading(true);
    try {
      const initiatives = await neighborService.listInitiatives();
      setProjects(initiatives.map(i => ({
        id: i.id,
        name: i.title,
        description: i.description || '',
        imageUrl: `https://picsum.photos/seed/${i.id}/800/600`,
        goalAmount: i.fundingGoal,
        currentAmount: i.currentFunding || 0,
        nonprofitId: i.nonprofitId || '',
        nonprofitName: i.nonprofit?.orgName || 'Community Fund',
        status: i.isActive ? 'ACTIVE' : 'COMPLETED',
        votes: 0 // Backend doesn't have votes yet, we'll keep it local for now
      })));
    } catch (error) {
      console.error('Failed to fetch initiatives:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const voteOnProject = async (projectId: string) => {
    if (!currentUser) return;
    const currentPoints = currentUser.impactPoints || 0;
    
    if (currentPoints < 100) {
      showToast('Impact Milestone Required: You need 100 Impact Points to cast a Priority Vote.', 'error');
      return;
    }

    // Local update for votes
    setProjects(prev => {
      const updated = prev.map(p => 
        p.id === projectId ? { ...p, votes: (p.votes || 0) + 1 } : p
      );
      return updated;
    });

    onUpdateUser({
      ...currentUser,
      impactPoints: currentPoints - 100
    });
    
    showToast('Priority Vote Recorded. You have influenced the community funding queue.', 'success');
  };

  const contributeToProject = async (projectId: string, amount: number) => {
    // In a real app, this would call a contribution API
    setProjects(prev => {
      const updated = prev.map(p => 
        p.id === projectId ? { ...p, currentAmount: p.currentAmount + amount } : p
      );
      return updated;
    });
  };

  return {
    projects,
    isLoading,
    voteOnProject,
    contributeToProject,
    refresh: fetchInitiatives
  };
}
