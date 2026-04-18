import { apiClient } from './apiClient';

export interface Initiative {
  id: string;
  title: string;
  description?: string;
  fundingGoal: number;
  currentFunding: number;
  nonprofitId?: string;
  nonprofit?: { orgName: string };
  isActive: boolean;
  createdBy: string;
}

export const neighborService = {
  getElectedNonprofit: async (): Promise<any> => {
    return apiClient.get('/neighbor/nonprofit');
  },

  setElectedNonprofit: async (nonprofitId: string): Promise<any> => {
    return apiClient.put('/neighbor/nonprofit', { nonprofitId });
  },

  listNonprofits: async (): Promise<any[]> => {
    return apiClient.get<any[]>('/neighbor/list-nonprofits');
  },

  listInitiatives: async (): Promise<Initiative[]> => {
    return apiClient.get<Initiative[]>('/neighbor/initiatives');
  },

  getInitiativeDetail: async (id: string): Promise<Initiative> => {
    return apiClient.get<Initiative>(`/neighbor/initiatives/${id}`);
  },

  createInitiative: async (data: any): Promise<Initiative> => {
    return apiClient.post<Initiative>('/neighbor/initiatives', data);
  },

  getImpactData: async (): Promise<any> => {
    return apiClient.get('/neighbor/impact');
  },

  waiveDiscountToInitiative: async (initiativeId: string, amount: number): Promise<any> => {
    return apiClient.post('/neighbor/waive-discount', { initiativeId, amount });
  },

  getQrToken: async (): Promise<{ token: string; expiresAt: string }> => {
    return apiClient.get('/neighbor/qr-token');
  }
};
