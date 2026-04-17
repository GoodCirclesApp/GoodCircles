import { apiClient } from './apiClient';

export interface Transaction {
  id: string;
  type: 'CREDIT' | 'DEBIT' | 'FUND' | 'WITHDRAWAL';
  amount: number;
  description: string;
  createdAt: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
}

export interface WalletBalance {
  balance: number;
}

export const walletService = {
  getBalance: async (): Promise<WalletBalance> => {
    return apiClient.get<WalletBalance>('/wallet/balance');
  },

  getCreditBalance: async (): Promise<WalletBalance> => {
    return apiClient.get<WalletBalance>('/wallet/credits/balance');
  },

  getHistory: async (page: number = 1, limit: number = 20): Promise<Transaction[]> => {
    return apiClient.get<Transaction[]>(`/wallet/history?page=${page}&limit=${limit}`);
  },

  fundWallet: async (amount: number, description?: string): Promise<any> => {
    return apiClient.post('/wallet/fund', { amount, description });
  },

  withdraw: async (amount: number, description?: string): Promise<any> => {
    return apiClient.post('/wallet/withdraw', { amount, description });
  }
};
