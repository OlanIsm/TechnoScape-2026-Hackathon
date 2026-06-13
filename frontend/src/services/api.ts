const API_BASE_URL = 'http://localhost:3000';

type ApiPayload = Record<string, unknown>;

export function getToken() {
  return localStorage.getItem('volumemate_token');
}

export function setToken(token: string) {
  localStorage.setItem('volumemate_token', token);
}

export function clearToken() {
  localStorage.removeItem('volumemate_token');
  localStorage.removeItem('volumemate_user');
}

async function request(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errMsg = 'Terjadi kesalahan pada server';
    try {
      const errData = await response.json();
      errMsg = errData.message || errMsg;
    } catch {
      errMsg = 'Terjadi kesalahan pada server';
    }
    throw new Error(errMsg);
  }

  return response.json();
}

export const api = {
  async login(email: string, password: string) {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.access_token) {
      setToken(data.access_token);
      localStorage.setItem('volumemate_user', JSON.stringify(data.user || { email }));
    }
    return data;
  },

  async register(data: ApiPayload) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getProfile() {
    return request('/auth/me');
  },

  async getDashboard() {
    return request('/dashboard');
  },

  async getActivePools() {
    return request('/orders/pools/active');
  },

  async createPool(data: ApiPayload) {
    return request('/orders/pools', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async joinPool(poolId: string, orderId: string) {
    return request(`/orders/pools/${poolId}/join`, {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    });
  },

  async getSuppliers() {
    return request('/suppliers');
  },

  async recordTransaction(data: ApiPayload) {
    return request('/orders/manual', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getAuditLogs() {
    return request('/orders/audit-logs');
  },

  async getProducts() {
    return request('/orders/products');
  },

  exportCsvUrl() {
    const token = getToken();
    return `${API_BASE_URL}/orders/export-csv?token=${token || ''}`;
  },

  clearToken() {
    clearToken();
  },
};
