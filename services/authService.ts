import { apiClient } from './apiClient';
import { User, UserRole } from '../types';

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  wallet?: { balance: number; currency: string };
}

export const authService = {
  async login(email: string, password?: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/login', { email, password });
  },

  async register(userData: {
    email: string;
    name: string;
    role: UserRole;
    password?: string;
    // Nonprofit fields
    ein?: string;
    orgName?: string;
    missionStatement?: string;
    // Merchant fields
    businessName?: string;
    businessType?: 'GOODS' | 'SERVICES' | 'BOTH';
    referralCode?: string;
    // CDFI fields
    cdfiOrgName?: string;
    cdfiCertificationNumber?: string;
    lendingRegions?: string[];
  }): Promise<AuthResponse> {
    const nameParts = (userData.name || '').trim().split(/\s+/);
    const firstName = nameParts[0] || 'Beta';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : firstName;

    return apiClient.post<AuthResponse>('/beta/register', {
      email: userData.email,
      password: userData.password,
      role: userData.role,
      firstName,
      lastName,
      businessName: userData.businessName,
      businessType: userData.businessType,
      referralCode: userData.referralCode,
      orgName: userData.orgName,
      ein: userData.ein,
      missionStatement: userData.missionStatement,
      cdfiOrgName: userData.cdfiOrgName,
      cdfiCertificationNumber: userData.cdfiCertificationNumber,
      lendingRegions: userData.lendingRegions,
    });
  },

  async getProfile(): Promise<User> {
    const data = await apiClient.get<any>('/auth/profile');
    return {
      ...data,
      cdfiId: data.cdfiPartner?.id ?? data.cdfiId,
      merchantId: data.merchant?.id ?? data.merchantId,
      nonprofitId: data.nonprofit?.id ?? data.nonprofitId,
    };
  },

  async updateProfile(userData: Partial<User>): Promise<User> {
    return apiClient.put<User>('/auth/profile', userData);
  },

  logout() {
    localStorage.removeItem('gc_auth_token');
    localStorage.removeItem('gc_refresh_token');
    localStorage.removeItem('gc_session_user');
  },
};
