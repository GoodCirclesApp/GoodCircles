
import { apiClient } from './apiClient';
import { Nonprofit, Order, CommunityInitiative } from '../types';

export const nonprofitService = {
  getStats: async () => {
    return apiClient.get('/nonprofit/stats');
  },

  getTransactions: async (page = 1, limit = 10) => {
    return apiClient.get(`/nonprofit/transactions?page=${page}&limit=${limit}`);
  },

  getAnalytics: async () => {
    return apiClient.get('/nonprofit/analytics');
  },

  getReferralInfo: async () => {
    return apiClient.get('/nonprofit/referral-info');
  },

  getInitiatives: async () => {
    return apiClient.get('/nonprofit/initiatives');
  },

  createInitiative: async (data: Partial<CommunityInitiative>) => {
    return apiClient.post('/nonprofit/initiatives', data);
  },

  updateProfile: async (data: Partial<Nonprofit>) => {
    return apiClient.put('/nonprofit/profile', data);
  },

  getPayouts: async () => {
    return apiClient.get('/nonprofit/payouts');
  },

  getStripeStatus: async () => {
    return apiClient.get('/nonprofit/stripe-status');
  }
};
