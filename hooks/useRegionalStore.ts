
import { useState, useEffect, useMemo } from 'react';
import { MOCK_COMMUNITIES } from '../constants';
import { Community, FiscalPolicy } from '../types';

export function useRegionalStore() {
  const [communities, setCommunities] = useState<Community[]>(MOCK_COMMUNITIES);
  const [selectedRegionId, setSelectedRegionId] = useState<string>('msa-la');

  const selectedRegion = useMemo(() => {
    return communities.find(c => c.id === selectedRegionId) || communities[0];
  }, [selectedRegionId, communities]);

  const setRegion = (id: string) => {
    setSelectedRegionId(id);
    localStorage.setItem('gc_selected_region', id);
  };

  const updateCommunityPolicy = (id: string, policy: FiscalPolicy) => {
    setCommunities(prev => prev.map(c => c.id === id ? { ...c, fiscalPolicy: policy } : c));
  };

  useEffect(() => {
    const saved = localStorage.getItem('gc_selected_region');
    if (saved && communities.some(c => c.id === saved)) {
      setSelectedRegionId(saved);
    }
  }, [communities]);

  return {
    selectedRegionId,
    selectedRegion,
    activePolicy: selectedRegion.fiscalPolicy,
    setRegion,
    allRegions: communities,
    updateCommunityPolicy
  };
}
