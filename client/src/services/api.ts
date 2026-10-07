const API_BASE = '/api';

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('cb_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include'
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }

  return data;
}

export const api = {
  // Auth
  register: (body: any) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  loginWithGoogle: (body: any) => apiRequest('/auth/google', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  getMe: () => apiRequest('/auth/me'),

  // Vendors
  getVendors: (params?: Record<string, any>) => {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return apiRequest(`/vendors${qs}`);
  },
  getVendorById: (id: string) => apiRequest(`/vendors/${id}`),
  updateVendor: (id: string, body: any) => apiRequest(`/vendors/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  createVendor: (body: any) => apiRequest('/vendors', { method: 'POST', body: JSON.stringify(body) }),

  // Menu
  getCategories: () => apiRequest('/menu/categories'),
  getMenuItems: (params?: Record<string, any>) => {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return apiRequest(`/menu${qs}`);
  },
  getMenuItemById: (id: string) => apiRequest(`/menu/${id}`),
  updateMenuItem: (id: string, body: any) => apiRequest(`/menu/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  createMenuItem: (body: any) => apiRequest('/menu', { method: 'POST', body: JSON.stringify(body) }),
  deleteMenuItem: (id: string) => apiRequest(`/menu/${id}`, { method: 'DELETE' }),

  // Cart
  getCart: () => apiRequest('/cart'),
  addToCart: (menuItemId: string, quantity = 1, customization = {}) =>
    apiRequest('/cart/items', { method: 'POST', body: JSON.stringify({ menuItemId, quantity, customization }) }),
  updateCartItem: (id: string, quantity: number) =>
    apiRequest(`/cart/items/${id}`, { method: 'PATCH', body: JSON.stringify({ quantity }) }),
  removeFromCart: (id: string) => apiRequest(`/cart/items/${id}`, { method: 'DELETE' }),
  clearCart: () => apiRequest('/cart', { method: 'DELETE' }),

  // Orders
  checkout: (body: any) => apiRequest('/orders', { method: 'POST', body: JSON.stringify(body) }),
  getOrders: () => apiRequest('/orders'),
  getOrderById: (id: string) => apiRequest(`/orders/${id}`),
  updateOrderStatus: (id: string, status: string) =>
    apiRequest(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  cancelOrder: (id: string) => apiRequest(`/orders/${id}/cancel`, { method: 'POST' }),
  reorder: (id: string) => apiRequest(`/orders/${id}/reorder`, { method: 'POST' }),

  // Favorites
  getFavorites: () => apiRequest('/favorites'),
  addFavorite: (vendorId: string) => apiRequest(`/favorites/${vendorId}`, { method: 'POST' }),
  removeFavorite: (vendorId: string) => apiRequest(`/favorites/${vendorId}`, { method: 'DELETE' }),

  // Notifications
  getNotifications: () => apiRequest('/notifications'),
  markNotificationAsRead: (id: string) => apiRequest(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsAsRead: () => apiRequest('/notifications/read-all', { method: 'PATCH' }),

  // AI
  getAIBudgetRecommendations: (budget: number, dietaryPreference = 'any', mealType = '') =>
    apiRequest('/ai/budget-recommendations', {
      method: 'POST',
      body: JSON.stringify({ budget, dietaryPreference, mealType })
    }),
  aiSearch: (userQuery: string) =>
    apiRequest('/ai/search', {
      method: 'POST',
      body: JSON.stringify({ userQuery })
    }),

  // Admin
  getAdminDashboard: () => apiRequest('/admin/dashboard'),
  getAdminOrders: (status?: string) => apiRequest(`/admin/orders${status ? `?status=${status}` : ''}`),
  getAdminStudents: () => apiRequest('/admin/users'),
  getAdminAnalytics: () => apiRequest('/admin/analytics')
};
