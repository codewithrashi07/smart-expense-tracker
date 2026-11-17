const API_BASE_URL = import.meta.env.VITE_API_URL || '';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('smarttrack_token');
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If not FormData, default to application/json
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
        localStorage.removeItem('smarttrack_token');
        localStorage.removeItem('smarttrack_user');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }

    return data;
  } catch (err) {
    throw err;
  }
}

export const api = {
  // Auth
  register: (body) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/api/auth/me'),
  updateProfile: (body) => request('/api/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),
  changePassword: (body) => request('/api/auth/change-password', { method: 'PUT', body: JSON.stringify(body) }),
  forgotPassword: (body) => request('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) }),
  resetPassword: (body) => request('/api/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),

  // Transactions
  getTransactions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/transactions?${query}`);
  },
  getTransaction: (id) => request(`/api/transactions/${id}`),
  createTransaction: (body) => request('/api/transactions', { method: 'POST', body: JSON.stringify(body) }),
  updateTransaction: (id, body) => request(`/api/transactions/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteTransaction: (id) => request(`/api/transactions/${id}`, { method: 'DELETE' }),
  uploadReceipt: (formData) => request('/api/transactions/upload-receipt', { method: 'POST', body: formData }),
  exportCSVUrl: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const token = localStorage.getItem('smarttrack_token');
    return `${API_BASE_URL}/api/transactions/export/csv?${query}`;
  },

  // Budgets
  getBudgets: (month) => request(`/api/budgets${month ? `?month=${month}` : ''}`),
  setBudget: (body) => request('/api/budgets', { method: 'POST', body: JSON.stringify(body) }),
  deleteBudget: (id) => request(`/api/budgets/${id}`, { method: 'DELETE' }),

  // Analytics
  getOverview: () => request('/api/analytics/overview'),
  getTrends: (months = 6) => request(`/api/analytics/trends?months=${months}`),
  getCategories: (timeRange = 'month') => request(`/api/analytics/categories?timeRange=${timeRange}`),
  getForecast: () => request('/api/analytics/forecast'),

  // Goals
  getGoals: () => request('/api/goals'),
  createGoal: (body) => request('/api/goals', { method: 'POST', body: JSON.stringify(body) }),
  updateGoal: (id, body) => request(`/api/goals/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteGoal: (id) => request(`/api/goals/${id}`, { method: 'DELETE' }),
  contributeGoal: (id, amount, note) => request(`/api/goals/${id}/contribute`, { method: 'POST', body: JSON.stringify({ amount, note }) }),

  // Recurring
  getRecurring: () => request('/api/recurring'),
  createRecurring: (body) => request('/api/recurring', { method: 'POST', body: JSON.stringify(body) }),
  updateRecurring: (id, body) => request(`/api/recurring/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteRecurring: (id) => request(`/api/recurring/${id}`, { method: 'DELETE' }),
  processRecurring: (id) => request(`/api/recurring/${id}/process`, { method: 'POST' }),

  // AI & OCR
  getAIInsights: () => request('/api/ai/insights'),
  chatAI: (prompt) => request('/api/ai/chat', { method: 'POST', body: JSON.stringify({ prompt }) }),
  scanReceiptOCR: (body) => request('/api/ai/scan-receipt', { method: 'POST', body: JSON.stringify(body) }),

  // Notifications
  getNotifications: () => request('/api/notifications'),
  markNotificationRead: (id) => request(`/api/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request('/api/notifications/read-all', { method: 'PUT' }),
  deleteNotification: (id) => request(`/api/notifications/${id}`, { method: 'DELETE' }),

  // Health
  checkHealth: () => request('/api/health'),
};
