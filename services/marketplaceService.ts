
import { apiClient } from './apiClient';
import { Product, CartItem, Order } from '../types';

export interface MarketplaceSearchParams {
  q?: string;
  type?: 'PRODUCT' | 'SERVICE';
  category?: string;
  price_min?: number;
  price_max?: number;
  page?: number;
  limit?: number;
}

export interface MarketplaceResponse {
  listings: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const marketplaceService = {
  async search(params: MarketplaceSearchParams = {}): Promise<MarketplaceResponse> {
    return apiClient.get<MarketplaceResponse>('/marketplace/search', params);
  },

  async getCategories(): Promise<string[]> {
    return apiClient.get<string[]>('/marketplace/categories');
  },

  async getListingDetail(id: string): Promise<Product> {
    return apiClient.get<Product>(`/marketplace/listings/${id}`);
  },

  async getAvailability(id: string, date: string): Promise<{ date: string; slots: string[] }> {
    return apiClient.get<{ date: string; slots: string[] }>(`/marketplace/listings/${id}/availability`, { date });
  },

  async checkout(payload: {
    items: { merchantId: string; productServiceId: string; nonprofitId?: string }[];
    paymentMethod: 'CARD' | 'BALANCE' | 'CASH';
    discountWaived?: boolean;
    waivedToInitiativeId?: string;
    creditsToApply?: number;
  }): Promise<{ message: string; orders: Order[] }> {
    return apiClient.post<{ message: string; orders: Order[] }>('/marketplace/checkout', payload);
  },

  async listOrders(page: number = 1, limit: number = 20): Promise<{ orders: Order[]; total: number }> {
    return apiClient.get<{ orders: Order[]; total: number }>('/marketplace/orders', { page, limit });
  },
};
