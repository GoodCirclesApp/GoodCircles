import { apiClient } from './apiClient';

export interface NationalOverview {
  national: {
    totalVolume: number;
    totalNonprofitFunding: number;
    totalTransactions: number;
    totalMerchants: number;
    totalNonprofits: number;
    cdfiCapitalDeployed: number;
    cdfiDeployments: number;
    activeUsers: number;
  };
  byState: StateRow[];
}

export interface StateRow {
  state: string;
  merchants: number;
  volume: number;
  nonprofitFunding: number;
  txCount: number;
}

export interface StateDetail {
  state: string;
  totals: { merchants: number; volume: number; nonprofitFunding: number; txCount: number };
  cities: CityRow[];
}

export interface CityRow {
  city: string;
  state: string;
  merchants: number;
  volume: number;
  nonprofitFunding: number;
  txCount: number;
}

export const impactService = {
  getOverview: () => apiClient.get<NationalOverview>('/impact/overview'),
  getStateDetail: (state: string) => apiClient.get<StateDetail>(`/impact/state/${state}`),
};
