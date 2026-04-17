import { apiClient } from './apiClient';

export interface CommunityFund {
  id: string;
  name: string;
  regionId: string;
  balance: number;
  totalContributions: number;
  totalDeployments: number;
}

export const communityFundService = {
  getFunds: async (regionId?: string): Promise<{ funds: CommunityFund[], isPhaseB: boolean }> => {
    const url = regionId ? `/api/community-fund?regionId=${regionId}` : '/api/community-fund';
    return apiClient.get<{ funds: CommunityFund[], isPhaseB: boolean }>(url);
  },

  contribute: async (userId: string, fundId: string, amount: number, source: string): Promise<any> => {
    return apiClient.post('/api/community-fund/contribute', { userId, fundId, amount, source });
  },

  applyForLoan: async (merchantId: string, fundId: string, amount: number, termMonths: number): Promise<any> => {
    return apiClient.post('/api/community-fund/apply', { merchantId, fundId, amount, termMonths });
  },

  getPortfolio: async (userId: string): Promise<any> => {
    return apiClient.get<any>(`/api/community-fund/portfolio/${userId}`);
  },

  processRepayment: async (deploymentId: string, amount: number): Promise<any> => {
    return apiClient.post('/api/community-fund/repayment', { deploymentId, amount });
  }
};
