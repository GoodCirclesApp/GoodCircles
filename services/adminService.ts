
import { apiClient } from './apiClient';

export const adminService = {
  getStats: () => apiClient.get<any>('/admin/stats'),
  getUsers: () => apiClient.get<any[]>('/admin/users'),
  getUserDetail: (userId: string) => apiClient.get<any>(`/admin/users/${userId}`),
  updateUserStatus: (userId: string, isActive: boolean) =>
    apiClient.put<any>(`/admin/users/${userId}/status`, { isActive }),
  editUser: (userId: string, data: { firstName?: string; lastName?: string; role?: string }) =>
    apiClient.put<any>(`/admin/users/${userId}`, data),
  resetUserPassword: (userId: string, newPassword: string) =>
    apiClient.post<any>(`/admin/users/${userId}/reset-password`, { newPassword }),
  issueCredits: (userId: string, amount: number, reason: string) =>
    apiClient.post<any>(`/admin/users/${userId}/credits`, { amount, reason }),
  adjustWalletBalance: (userId: string, amount: number, type: 'CREDIT' | 'DEBIT', reason: string) =>
    apiClient.post<any>(`/admin/users/${userId}/balance`, { amount, type, reason }),
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
  getDiskUsage: () => apiClient.get<any>('/admin/disk-usage'),
  clearIrsData: () => apiClient.post<any>('/admin/irs/clear', {}),
  getCdfiApplicants: () => apiClient.get<any[]>('/admin/cdfi'),
  activateCdfi: (cdfiId: string) => apiClient.post<any>(`/admin/cdfi/${cdfiId}/activate`, {}),
  deactivateCdfi: (cdfiId: string) => apiClient.post<any>(`/admin/cdfi/${cdfiId}/deactivate`, {}),
  changeAdminPassword: (currentPassword: string, newPassword: string) =>
    apiClient.post<any>('/admin/change-password', { currentPassword, newPassword }),
  getFeatureFlags: () => apiClient.get<any>('/admin/flags'),
  updateFeatureFlag: (key: string, value: boolean) =>
    // Backend expects { flag, value } (adminController.updateFeatureFlag); sending
    // `key` made `flag` undefined → 400 "flag (string) and value (boolean) required".
    apiClient.post<any>('/admin/flags', { flag: key, value }),
  getDemoMode: () => apiClient.get<any>('/admin/demo-mode'),
  setDemoMode: (enabled: boolean) => apiClient.post<any>('/admin/demo-mode', { enabled }),
  getAuditLog: () => apiClient.get<any[]>('/admin/audit-log'),
  getErrorLogs: (params?: { page?: number; resolved?: boolean; level?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (typeof params?.resolved === 'boolean') q.set('resolved', String(params.resolved));
    if (params?.level) q.set('level', params.level);
    const qs = q.toString();
    return apiClient.get<any>(`/admin/error-logs${qs ? `?${qs}` : ''}`);
  },
  resolveErrorLog: (id: string, resolved = true) =>
    apiClient.post<any>(`/admin/error-logs/${id}/resolve`, { resolved }),
  clearErrorLogs: (all = false) => apiClient.post<any>('/admin/error-logs/clear', { all }),
  resetDemo: () => apiClient.post<any>('/admin/demo/reset', {}),
};
