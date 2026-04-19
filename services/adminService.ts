
import { apiClient } from './apiClient';

export const adminService = {
  getStats: () => apiClient.get<any>('/admin/stats'),
  getUsers: () => apiClient.get<any[]>('/admin/users'),
  updateUserStatus: (userId: string, isActive: boolean) => 
    apiClient.put<any>(`/admin/users/${userId}/status`, { isActive }),
  getTransactions: () => apiClient.get<any[]>('/admin/transactions'),
  refundTransaction: (txId: string) => 
    apiClient.post<any>(`/admin/transactions/${txId}/refund`, {}),
  getFinancials: () => apiClient.get<any>('/admin/financials'),
  getCooperatives: () => apiClient.get<any[]>('/admin/cooperatives'),
  getCommunityFund: () => apiClient.get<any>('/admin/community-fund'),
  getMunicipalPartners: () => apiClient.get<any[]>('/admin/municipal-partners'),
  getDataCoop: () => apiClient.get<any>('/admin/data-coop'),
  getSystemHealth: () => apiClient.get<any>('/admin/system-health'),
  getSentinelFlags: () => apiClient.get<any[]>('/admin/sentinel-flags'),
  resolveSentinelFlag: (flagId: string, approve: boolean) =>
    apiClient.post<any>(`/admin/sentinel-flags/${flagId}/resolve`, { approve }),
  seedNonprofits: () => apiClient.post<any>('/admin/seed-nonprofits', {}),
};
