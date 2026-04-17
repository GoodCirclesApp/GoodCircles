import { apiClient } from './apiClient';

export interface MerchantProfile {
  id: string;
  businessName: string;
  description?: string;
  category?: string;
  creditAcceptance: 'NONE' | 'FULL' | 'PARTIAL';
  maxCreditPercentage: number;
  isCreditEligible: boolean;
}

export interface Listing {
  id: string;
  name: string;
  description?: string;
  price: number;
  cogs: number;
  type: 'PRODUCT' | 'SERVICE';
  category: string;
  isActive: boolean;
}

export const merchantService = {
  getProfile: async (): Promise<MerchantProfile> => {
    return apiClient.get<MerchantProfile>('/merchant/profile');
  },

  updateProfile: async (data: Partial<MerchantProfile>): Promise<MerchantProfile> => {
    return apiClient.put<MerchantProfile>('/merchant/profile', data);
  },

  getListings: async (): Promise<Listing[]> => {
    return apiClient.get<Listing[]>('/merchant/listings');
  },

  createListing: async (data: any): Promise<Listing> => {
    return apiClient.post<Listing>('/merchant/listings', data);
  },

  updateListing: async (id: string, data: any): Promise<Listing> => {
    return apiClient.put<Listing>(`/merchant/listings/${id}`, data);
  },

  deleteListing: async (id: string): Promise<void> => {
    return apiClient.delete(`/merchant/listings/${id}`);
  },

  getTransactions: async (): Promise<any[]> => {
    return apiClient.get<any[]>('/merchant/transactions');
  },

  getImpact: async (): Promise<any> => {
    return apiClient.get<any>('/merchant/impact');
  },

  getDashboardMetrics: async (): Promise<any> => {
    return apiClient.get<any>('/merchant/dashboard/metrics');
  },

  getRevenueChartData: async (): Promise<any[]> => {
    return apiClient.get<any[]>('/merchant/dashboard/revenue-chart');
  },

  getFinancialReport: async (params: { startDate?: string; endDate?: string }): Promise<any[]> => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get<any[]>(`/merchant/reports/financial?${query}`);
  },

  getBookings: async (): Promise<any[]> => {
    return apiClient.get<any[]>('/merchant/bookings');
  },

  updateBookingStatus: async (id: string, status: string): Promise<any> => {
    return apiClient.put<any>(`/merchant/bookings/${id}/status`, { status });
  },

  getCoopDeals: async (): Promise<any[]> => {
    return apiClient.get<any[]>('/merchant/coop/deals');
  },

  commitToCoopDeal: async (dealId: string, quantity: number): Promise<any> => {
    return apiClient.post<any>(`/merchant/coop/deals/${dealId}/commit`, { quantity });
  },

  getSupplyChainMatches: async (): Promise<any[]> => {
    return apiClient.get<any[]>('/merchant/supply-chain/matches');
  },

  getBenefitsPrograms: async (): Promise<any[]> => {
    return apiClient.get<any[]>('/merchant/benefits/programs');
  },

  enrollInBenefit: async (programId: string): Promise<any> => {
    return apiClient.post<any>(`/merchant/benefits/enroll`, { programId });
  },

  setupStripe: async (): Promise<{ url: string }> => {
    return apiClient.post<{ url: string }>('/merchant/stripe-setup', {});
  }
};
