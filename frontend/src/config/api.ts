const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit & { token?: string | null; campusId?: string | null } = {}
): Promise<T> {
  const { token, campusId, headers = {}, ...rest } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  if (campusId) {
    requestHeaders['x-campus-id'] = campusId;
  }

  let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (cleanEndpoint.startsWith('/api/v1')) {
    cleanEndpoint = cleanEndpoint.substring('/api/v1'.length) || '/';
  }
  const response = await fetch(`${API_BASE_URL}${cleanEndpoint}`, {
    ...rest,
    headers: requestHeaders,
  });

  let data: any = {};

  if (typeof response.text === 'function') {
    try {
      const rawText = await response.text();
      if (rawText && rawText.trim().length > 0) {
        try {
          data = JSON.parse(rawText);
        } catch {
          data = { message: rawText };
        }
      }
    } catch {
      if (typeof response.json === 'function') {
        try {
          data = await response.json();
        } catch {
          data = {};
        }
      }
    }
  } else if (typeof response.json === 'function') {
    try {
      data = await response.json();
    } catch {
      data = {};
    }
  }

  if (!response.ok) {
    const errorMsg =
      data?.message ||
      data?.error ||
      (response.status === 504 || response.status === 502
        ? `Backend API server is currently unreachable (HTTP ${response.status}). Please verify the backend service is running on port 5000.`
        : `HTTP error ${response.status}`);
    throw new Error(errorMsg);
  }

  return data;
}

export const API = {
  // Auth
  login: (payload: { phoneOrEmail: string; password?: string; role: string; totpCode?: string }) =>
    apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  signup: (payload: any) =>
    apiRequest('/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
  sendEmailOtp: (payload: { email: string; matricNumber: string; campusId?: string; fullName?: string }) =>
    apiRequest('/auth/send-email-otp', { method: 'POST', body: JSON.stringify(payload) }),
  verifyEmailOtp: (payload: { email: string; code: string }) =>
    apiRequest('/auth/verify-email-otp', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: (token: string) =>
    apiRequest('/auth/me', { token }),
  getDemoTotp: () =>
    apiRequest('/auth/demo-totp'),
  get: (endpoint: string, options?: any) =>
    apiRequest(endpoint, { method: 'GET', ...options }),

  // Campuses
  getCampuses: () =>
    apiRequest('/campuses'),
  getHostels: (campusId: string) =>
    apiRequest(`/campuses/${campusId}/hostels`),

  // Products
  getProducts: (params: {
    campusId?: string;
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    hostelName?: string;
    condition?: string;
  } = {}) => {
    const query = new URLSearchParams();
    if (params.category) query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    if (params.minPrice) query.append('minPrice', params.minPrice.toString());
    if (params.maxPrice) query.append('maxPrice', params.maxPrice.toString());
    if (params.hostelName) query.append('hostelName', params.hostelName);
    if (params.condition) query.append('condition', params.condition);
    const qs = query.toString();
    return apiRequest(`/products${qs ? `?${qs}` : ''}`, { campusId: params.campusId });
  },
  getProductById: (id: string) =>
    apiRequest(`/products/${id}`),
  createProduct: (productData: any, token: string, campusId: string) =>
    apiRequest('/products', { method: 'POST', body: JSON.stringify(productData), token, campusId }),
  updateProduct: (id: string, updates: any, token: string) =>
    apiRequest(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(updates), token }),
  toggleProductStock: (id: string, token: string) =>
    apiRequest(`/products/${id}/toggle-stock`, { method: 'POST', token }),
  deleteProduct: (id: string, token: string) =>
    apiRequest(`/products/${id}`, { method: 'DELETE', token }),

  // Orders & Escrow
  createOrder: (orderData: any, token: string, campusId: string) =>
    apiRequest('/orders/create', { method: 'POST', body: JSON.stringify(orderData), token, campusId }),
  checkoutCart: (cartData: any, token: string, campusId: string) =>
    apiRequest('/orders/checkout-cart', { method: 'POST', body: JSON.stringify(cartData), token, campusId }),
  getOrderTracking: (orderId: string, token: string) =>
    apiRequest(`/orders/${orderId}/tracking`, { token }),
  getMyOrders: (token: string) =>
    apiRequest('/orders/my-orders', { token }),
  simulatePaystackWebhook: (reference: string) =>
    apiRequest('/orders/webhooks/paystack', { method: 'POST', body: JSON.stringify({ reference }) }),
  demoPaystackCheckout: (reference: string, channel: string = 'card') =>
    apiRequest('/orders/paystack/demo-checkout', {
      method: 'POST',
      body: JSON.stringify({ reference, channel }),
    }),
  reportOrderDispute: (
    orderId: string,
    payload: { reason: string; issueCategory?: string },
    token: string
  ) =>
    apiRequest(`/orders/${orderId}/dispute`, {
      method: 'POST',
      body: JSON.stringify(payload),
      token,
    }),

  // Dispatch / Courier
  getAvailableDeliveries: (token: string, campusId: string) =>
    apiRequest('/dispatch/available', { token, campusId }),
  getActiveCourierJob: (token: string) =>
    apiRequest('/dispatch/active-job', { token }),
  getActiveCourierJobs: (token: string) =>
    apiRequest('/dispatch/active-jobs', { token }),
  getCourierStats: (token: string) =>
    apiRequest('/dispatch/stats', { token }),
  getCompletedDeliveries: (token: string) =>
    apiRequest('/dispatch/completed', { token }),
  acceptDelivery: (orderId: string, token: string) =>
    apiRequest('/dispatch/accept', { method: 'POST', body: JSON.stringify({ orderId }), token }),
  updateMilestone: (orderId: string, milestone: string, token: string) =>
    apiRequest('/dispatch/milestone', { method: 'POST', body: JSON.stringify({ orderId, milestone }), token }),
  confirmItemPickup: (orderId: string, productId: string, token: string) =>
    apiRequest('/dispatch/confirm-pickup', {
      method: 'POST',
      body: JSON.stringify({ orderId, productId }),
      token,
    }),
  verifyPin: (orderId: string, pin: string, token: string) =>
    apiRequest('/dispatch/verify-pin', { method: 'POST', body: JSON.stringify({ orderId, pin }), token }),
  addCourierBankAccount: (
    payload: { bankName: string; accountNumber: string; accountName: string },
    token: string
  ) =>
    apiRequest('/dispatch/bank-account', {
      method: 'POST',
      body: JSON.stringify(payload),
      token,
    }),
  rateCourier: (
    payload: { orderId: string; courierId?: string; rating: number; comment?: string },
    token: string
  ) =>
    apiRequest('/dispatch/rate', {
      method: 'POST',
      body: JSON.stringify(payload),
      token,
    }),

  // Admin
  getDashboardStats: (token: string, campusId?: string) =>
    apiRequest(`/admin/dashboard-stats${campusId ? `?campusId=${campusId}` : ''}`, { token }),
  getDispatchStream: (token: string, campusId?: string) =>
    apiRequest(`/admin/dispatch-stream${campusId ? `?campusId=${campusId}` : ''}`, { token }),
  getPayouts: (token: string, campusId?: string) =>
    apiRequest(`/admin/payouts${campusId ? `?campusId=${campusId}` : ''}`, { token }),
  getDisputes: (token: string, campusId?: string) =>
    apiRequest(`/admin/disputes${campusId ? `?campusId=${campusId}` : ''}`, { token }),
  getDisputeById: (disputeId: string, token: string) =>
    apiRequest(`/admin/disputes/${disputeId}`, { token }),
  resolveDispute: (disputeId: string, action: 'refund_buyer' | 'release_to_vendor', resolutionNotes: string, token: string) =>
    apiRequest(`/admin/disputes/${disputeId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ action, resolutionNotes }),
      token,
    }),
  approveCourier: (courierId: string, isApproved: boolean, token: string) =>
    apiRequest(`/admin/couriers/${courierId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ isApproved }),
      token,
    }),
  provisionFleetCourier: (
    payload: {
      fullName: string;
      whatsappPhone: string;
      baseHostelId: string;
      campusId?: string;
      customPassword?: string;
    },
    token: string
  ) =>
    apiRequest('/admin/couriers/provision', {
      method: 'POST',
      body: JSON.stringify(payload),
      token,
    }),

  // Vendor
  getVendorOrders: (token: string) =>
    apiRequest('/vendor/orders', { token }),
  getVendorNotifications: (token: string) =>
    apiRequest('/vendor/notifications', { token }),
  clearVendorNotifications: (token: string) =>
    apiRequest('/vendor/notifications', { method: 'DELETE', token }),
  getVendorPayoutAccounts: (token: string) =>
    apiRequest('/vendor/payout-accounts', { token }),
  addVendorPayoutAccount: (
    payload: {
      bankName: string;
      bankCode?: string;
      accountNumber: string;
      accountName: string;
      isPrimary?: boolean;
    },
    token: string
  ) =>
    apiRequest('/vendor/payout-accounts', {
      method: 'POST',
      body: JSON.stringify(payload),
      token,
    }),
  setPrimaryPayoutAccount: (id: string, token: string) =>
    apiRequest(`/vendor/payout-accounts/${id}/primary`, {
      method: 'PUT',
      token,
    }),
  deleteVendorPayoutAccount: (id: string, token: string) =>
    apiRequest(`/vendor/payout-accounts/${id}`, {
      method: 'DELETE',
      token,
    }),
};

