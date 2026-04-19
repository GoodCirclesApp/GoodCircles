
/**
 * Good Circles API Client
 * Handles authenticated requests to the Express backend.
 */

const API_BASE_URL = '/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

async function tryRefreshToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('gc_refresh_token');
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.accessToken) {
      localStorage.setItem('gc_auth_token', data.accessToken);
      if (data.refreshToken) localStorage.setItem('gc_refresh_token', data.refreshToken);
      return data.accessToken;
    }
    return null;
  } catch {
    return null;
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, ...init } = options;

  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, String(value));
    });
    url += `?${searchParams.toString()}`;
  }

  const token = localStorage.getItem('gc_auth_token');
  const headers = new Headers(init.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, { ...init, headers });

  if ((response.status === 401 || response.status === 403) && !endpoint.startsWith('/auth/')) {
    let newToken: string | null = null;

    if (isRefreshing) {
      newToken = await new Promise<string | null>((resolve) => {
        refreshQueue.push(resolve);
      });
    } else {
      isRefreshing = true;
      newToken = await tryRefreshToken();
      refreshQueue.forEach((cb) => cb(newToken));
      refreshQueue = [];
      isRefreshing = false;
    }

    if (newToken) {
      headers.set('Authorization', `Bearer ${newToken}`);
      const retryResponse = await fetch(url, { ...init, headers });
      if (!retryResponse.ok) {
        const errorData = await retryResponse.json().catch(() => ({}));
        throw new Error(errorData.error || `API Request failed with status ${retryResponse.status}`);
      }
      return retryResponse.json();
    }

    // Refresh failed — clear auth and redirect to login
    localStorage.removeItem('gc_auth_token');
    localStorage.removeItem('gc_refresh_token');
    window.location.href = '/login';
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API Request failed with status ${response.status}`);
  }

  return response.json();
}

export const apiClient = {
  get: <T>(endpoint: string, params?: Record<string, any>): Promise<T> => {
    return request<T>(endpoint, { method: 'GET', params });
  },

  post: <T>(endpoint: string, body: any): Promise<T> => {
    return request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  put: <T>(endpoint: string, body: any): Promise<T> => {
    return request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  delete: <T>(endpoint: string): Promise<T> => {
    return request<T>(endpoint, { method: 'DELETE' });
  },
};
