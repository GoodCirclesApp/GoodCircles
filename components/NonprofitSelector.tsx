import React, { useState, useEffect } from 'react';
import './NonprofitSelector.module.css';

interface Nonprofit {
  id: string;
  name: string;
  description: string;
  impact: string;
  logo?: string;
}

interface NonprofitSelectorProps {
  onSelect: (nonprofitId: string) => void;
  currentNonprofitId?: string;
  isLoading?: boolean;
}

export const NonprofitSelector: React.FC<NonprofitSelectorProps> = ({
  onSelect,
  currentNonprofitId,
  isLoading = false,
}) => {
  const [nonprofits, setNonprofits] = useState<Nonprofit[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNonprofits();
  }, []);

  const fetchNonprofits = async () => {
    try {
      const response = await fetch('/api/nonprofits');
      if (!response.ok) throw new Error('Failed to fetch nonprofits');
      const data = await response.json();
      setNonprofits(data);
    } catch (err) {
      setError('Could not load nonprofits. Please try again.');
      console.error(err);
    }
  };

  const handleSelect = async (nonprofitId: string) => {
    try {
      const response = await fetch('/api/user/nonprofit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nonprofitId }),
      });
      if (!response.ok) throw new Error('Failed to select nonprofit');
      onSelect(nonprofitId);
    } catch (err) {
      setError('Could not select nonprofit. Please try again.');
      console.error(err);
    }
  };

  const styles = {
    container: 'max-w-4xl mx-auto px-4 py-8',
    header: 'text-center mb-8',
    title: 'text-3xl font-black text-[#7851A9] uppercase mb-2 tracking-tight',
    subtitle: 'text-sm text-slate-600 font-medium',
    grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8',
    card: 'p-6 border-2 border-slate-200 rounded-2xl bg-white cursor-pointer transition-all hover:border-[#CA9CE1] hover:shadow-lg hover:shadow-[#7851A9]/10',
    cardSelected: 'border-[#7851A9] bg-[#7851A9] text-white shadow-lg shadow-[#7851A9]/20',
    logo: 'w-16 h-16 rounded-lg object-cover',
    name: 'text-lg font-black uppercase tracking-wide mt-4',
    description: 'text-sm text-slate-600 line-clamp-2 mt-2',
    cardSelectedDescription: 'text-white/90',
    impact: 'flex items-center gap-2 text-xs font-bold uppercase tracking-wider pt-4 border-t border-slate-200 mt-4',
    cardSelectedImpact: 'border-t-white/20',
    impactValue: 'text-[#7851A9] font-black',
    cardSelectedImpactValue: 'text-yellow-300',
    checkmark: 'absolute top-4 right-4 w-7 h-7 bg-[#7851A9] text-white rounded-full flex items-center justify-center font-black text-lg',
    cardSelectedCheckmark: 'bg-yellow-300 text-[#7851A9]',
    error: 'bg-red-50 border border-red-200 rounded-xl p-6 mb-8 text-center',
    errorText: 'text-red-600 font-semibold mb-4',
    retryButton: 'px-6 py-2 bg-red-600 text-white rounded-lg font-bold text-xs uppercase hover:bg-red-700 transition-colors',
    loading: 'text-center py-12 text-slate-400 font-semibold',
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Choose Your Cause</h2>
        <p className={styles.subtitle}>
          Select a nonprofit to receive 10% of your purchase
        </p>
      </div>

      {error && (
        <div className={styles.error}>
          <p className={styles.errorText}>{error}</p>
          <button onClick={fetchNonprofits} className={styles.retryButton}>
            Retry
          </button>
        </div>
      )}

      <div className={styles.grid}>
        {nonprofits.map((nonprofit) => {
          const isSelected = currentNonprofitId === nonprofit.id;
          return (
            <div
              key={nonprofit.id}
              className={`${styles.card} ${isSelected ? styles.cardSelected : ''} relative`}
              onClick={() => handleSelect(nonprofit.id)}
            >
              {nonprofit.logo && (
                <img
                  src={nonprofit.logo}
                  alt={nonprofit.name}
                  className={styles.logo}
                />
              )}
              <h3 className={styles.name}>{nonprofit.name}</h3>
              <p className={`${styles.description} ${isSelected ? styles.cardSelectedDescription : ''}`}>
                {nonprofit.description}
              </p>
              <div className={`${styles.impact} ${isSelected ? styles.cardSelectedImpact : ''}`}>
                <span>Impact:</span>
                <span className={`${styles.impactValue} ${isSelected ? styles.cardSelectedImpactValue : ''}`}>
                  {nonprofit.impact}
                </span>
              </div>
              {isSelected && (
                <div className={`${styles.checkmark} ${styles.cardSelectedCheckmark}`}>✓</div>
              )}
            </div>
          );
        })}
      </div>

      {nonprofits.length === 0 && !error && (
        <div className={styles.loading}>
          <p>Loading nonprofits...</p>
        </div>
      )}
    </div>
  );
};

export default NonprofitSelector;
