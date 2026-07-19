// lib/api.ts

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://fishingecommerce-production.up.railway.app';

// Helper to get JWT token from localStorage
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const session = localStorage.getItem('user_session');
    if (session) {
      const parsed = JSON.parse(session);
      return parsed.token || null;
    }
  } catch (e) {
    console.error('Error reading auth token from session:', e);
  }
  return null;
}

// Helper to set session in localStorage
export function setSession(email: string, token: string, role: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('user_session', JSON.stringify({
    email,
    token,
    role,
    loginTime: new Date().toISOString()
  }));
}

// Fetch helper wrapper
async function fetchAPI<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  let data: any = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { message: text };
    }
  }

  if (!response.ok) {
    const errorMsg = data.error || data.message || `API error (status: ${response.status})`;
    throw new Error(errorMsg);
  }

  return data as T;
}

// Auth endpoints
export const authApi = {
  register: (body: any) => fetchAPI('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  }),
  login: (body: any) => fetchAPI('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  }),
  sendOTP: (email: string) => fetchAPI('/api/v1/auth/otp/request', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),
  verifyOTP: (email: string, otp: string) => fetchAPI('/api/v1/auth/otp/verify', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  }),
  changePassword: (body: any) => fetchAPI('/api/v1/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(body),
  }),
  adminLogin: (body: any) => fetchAPI('/api/v1/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  }),
};

// User Profile endpoints
export const userApi = {
  getProfile: () => fetchAPI('/api/v1/users/me'),
  updateProfile: (body: any) => fetchAPI('/api/v1/users/me', {
    method: 'PUT',
    body: JSON.stringify(body),
  }),
};

// Cart endpoints
export const cartApi = {
  getCart: () => fetchAPI('/api/v1/cart'),
  addItem: (body: { variantId: number; quantity: number }) => fetchAPI('/api/v1/cart/items', {
    method: 'POST',
    body: JSON.stringify(body),
  }),
  updateQuantity: (itemId: number, quantity: number) => fetchAPI(`/api/v1/cart/items/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  }),
  deleteItem: (itemId: number) => fetchAPI(`/api/v1/cart/items/${itemId}`, {
    method: 'DELETE',
  }),
  buyNow: (body: { variantId: number; quantity: number }) => fetchAPI('/api/v1/cart/buy-now', {
    method: 'POST',
    body: JSON.stringify(body),
  }),
};

// Order endpoints
export const orderApi = {
  createOrder: (body: any) => fetchAPI('/api/v1/orders', {
    method: 'POST',
    body: JSON.stringify(body),
  }),
  getMyOrders: () => fetchAPI('/api/v1/orders/me'),
  trackOrder: (orderCode: string) => fetchAPI(`/api/v1/orders/tracking/${orderCode}`),
  getShippingFee: (body: { province: string; district?: string; items: Array<{ variantId: number | string; quantity: number }> }) => fetchAPI('/api/v1/orders/shipping-fee', {
    method: 'POST',
    body: JSON.stringify(body),
  }),
  getPaymentStatus: (orderCode: string) => fetchAPI(`/api/v1/orders/tracking/${orderCode}/payment-status`),
  recreatePaymentLink: (orderCode: string) => fetchAPI(`/api/v1/orders/${orderCode}/recreate-payment-link`, {
    method: 'POST',
  }),
};

// Coupon endpoints
export const couponApi = {
  validateCoupon: (couponCode: string, orderAmount: number) => fetchAPI('/api/v1/coupons/validate', {
    method: 'POST',
    body: JSON.stringify({ couponCode, orderAmount }),
  }),
};

// Product endpoints
export const productApi = {
  getProductById: (id: string | number) => fetchAPI(`/api/v1/products/${id}`),
  getVariantsByProductId: (id: string | number) => fetchAPI(`/api/v1/products/${id}/variants`),
  searchProducts: (keyword: string) => fetchAPI(`/api/v1/products/search/${keyword}`),
  getProducts: (params?: { categoryId?: number | string; brandId?: number | string; isVisible?: boolean; page?: number; size?: number; sort?: string[] }) => {
    let url = '/api/v1/products';
    const query = [];
    if (params?.categoryId) query.push(`categoryId=${params.categoryId}`);
    if (params?.brandId) query.push(`brandId=${params.brandId}`);
    if (params?.isVisible !== undefined) query.push(`isVisible=${params.isVisible}`);
    if (params?.page !== undefined) query.push(`page=${params.page}`);
    if (params?.size !== undefined) query.push(`size=${params.size}`);
    if (params?.sort && params.sort.length > 0) {
      params.sort.forEach(s => query.push(`sort=${encodeURIComponent(s)}`));
    }
    if (query.length > 0) url += `?${query.join('&')}`;
    return fetchAPI(url);
  },
  getPromotedProducts: () => fetchAPI('/api/v1/products/promotions'),
  getCategoriesTree: () => fetchAPI('/api/v1/categories/tree'),
  getAllBrands: () => fetchAPI('/api/v1/brands'),
  getAllTags: () => fetchAPI('/api/v1/tags'),
};

// Review endpoints
export const reviewApi = {
  getReviews: (productId: number | string, page: number = 0, size: number = 10) => 
    fetchAPI(`/api/v1/reviews?productId=${productId}&page=${page}&size=${size}`),
  createReview: (body: { orderId: number; productId: number; rating: number; text: string; images?: string[] }) => 
    fetchAPI('/api/v1/reviews', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};

// Admin Management endpoints
export const adminApi = {
  getRevenueReport: (fromDate?: string, toDate?: string) => {
    let url = '/api/v1/admin/reports/revenue';
    const params = [];
    if (fromDate) params.push(`fromDate=${fromDate}`);
    if (toDate) params.push(`toDate=${toDate}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return fetchAPI(url);
  },
  getTopSellingReport: (fromDate?: string, toDate?: string) => {
    let url = '/api/v1/admin/reports/top-selling';
    const params = [];
    if (fromDate) params.push(`fromDate=${fromDate}`);
    if (toDate) params.push(`toDate=${toDate}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return fetchAPI(url);
  },
  getOrders: (status?: string) => {
    let url = '/api/v1/admin/orders';
    if (status) url += `?status=${status}`;
    return fetchAPI(url);
  },
  updateOrderStatus: (id: number | string, status: string) => fetchAPI(`/api/v1/admin/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
  cancelOrder: (id: number | string, reason: string) => fetchAPI(`/api/v1/admin/orders/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  }),
  createProduct: (body: any) => fetchAPI('/api/v1/admin/products', {
    method: 'POST',
    body: JSON.stringify(body),
  }),
  createProductFull: (body: any) => fetchAPI('/api/v1/admin/products/full', {
    method: 'POST',
    body: JSON.stringify(body),
  }),
  updateProduct: (id: number | string, body: any) => fetchAPI(`/api/v1/admin/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  }),
  deleteProduct: (id: number | string) => fetchAPI(`/api/v1/admin/products/${id}`, {
    method: 'DELETE',
  }),
  createVariant: (productId: number | string, body: any) => fetchAPI(`/api/v1/admin/products/${productId}/variants`, {
    method: 'POST',
    body: JSON.stringify(body),
  }),
  updateVariantPrice: (variantId: number | string, price: number) => fetchAPI(`/api/v1/admin/variants/${variantId}/price`, {
    method: 'PUT',
    body: JSON.stringify({ price, basePrice: price }),
  }),
  updateVariant: (variantId: number | string, body: any) => fetchAPI(`/api/v1/admin/variants/${variantId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  }),
  deleteVariant: (variantId: number | string) => fetchAPI(`/api/v1/admin/variants/${variantId}`, {
    method: 'DELETE',
  }),
  getOutOfStockAlerts: () => fetchAPI('/api/v1/inventory/alerts/out-of-stock'),
  getInventoryLogs: (params?: { variantId?: number | string; fromDate?: string; toDate?: string }) => {
    let url = '/api/v1/inventory/logs';
    const query = [];
    if (params?.variantId) query.push(`variantId=${params.variantId}`);
    if (params?.fromDate) query.push(`fromDate=${params.fromDate}`);
    if (params?.toDate) query.push(`toDate=${params.toDate}`);
    if (query.length > 0) url += `?${query.join('&')}`;
    return fetchAPI(url);
  },
  updateVariantStock: (variantId: number | string, stockQuantity: number, reason?: string) => fetchAPI(`/api/v1/admin/variants/${variantId}/stock`, {
    method: 'PUT',
    body: JSON.stringify({ stockQuantity, reason: reason || 'Nhập kho bổ sung' }),
  }),
  updateRoles: (id: number | string, roleIds: number[]) => fetchAPI(`/api/v1/admin/users/${id}/roles`, {
    method: 'PUT',
    body: JSON.stringify({ roleIds }),
  }),
  getCategoriesTree: () => fetchAPI('/api/v1/admin/categories/tree'),
  updateCategoriesTree: (tree: Array<{ id: number; parentId: number | null; sortOrder: number }>) => fetchAPI('/api/v1/admin/categories/tree', {
    method: 'PUT',
    body: JSON.stringify({ tree }),
  }),
  createCategory: (body: { name: string; parentId?: number | null }) => fetchAPI('/api/v1/admin/categories', {
    method: 'POST',
    body: JSON.stringify(body),
  }),
  updateCategory: (id: number | string, body: { name: string; parentId?: number | null }) => fetchAPI(`/api/v1/admin/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  }),
  deleteCategory: (id: number | string) => fetchAPI(`/api/v1/admin/categories/${id}`, {
    method: 'DELETE',
  }),
  getAllAdmins: () => fetchAPI('/api/v1/admin/users'),
  createAdminUser: (body: any) => fetchAPI('/api/v1/admin/users', {
    method: 'POST',
    body: JSON.stringify(body),
  }),
  getAllTags: () => fetchAPI('/api/v1/admin/tags'),
  createTag: (tagName: string) => fetchAPI('/api/v1/admin/tags', {
    method: 'POST',
    body: JSON.stringify({ tagName }),
  }),
  getAllPosts: () => fetchAPI('/api/v1/admin/posts'),
  createPost: (body: any) => fetchAPI('/api/v1/admin/posts', {
    method: 'POST',
    body: JSON.stringify(body),
  }),
  deletePost: (id: number | string) => fetchAPI(`/api/v1/admin/posts/${id}`, {
    method: 'DELETE',
  }),
  getAllBrands: () => fetchAPI('/api/v1/admin/brands'),
  createBrand: (body: { name: string; country?: string }) => fetchAPI('/api/v1/admin/brands', {
    method: 'POST',
    body: JSON.stringify(body),
  }),
  deleteBrand: (id: number | string) => fetchAPI(`/api/v1/admin/brands/${id}`, {
    method: 'DELETE',
  }),
  getProductById: (id: number | string) => fetchAPI(`/api/v1/admin/products/${id}`),
  getOrderById: (id: number | string) => fetchAPI(`/api/v1/admin/orders/${id}`),
  updateProductStatus: (id: number | string, isVisible: boolean) => fetchAPI(`/api/v1/admin/products/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ isVisible }),
  }),
  confirmPayOSWebhook: () => fetchAPI('/api/v1/payments/payos/confirm-webhook', {
    method: 'POST'
  }),
  getSuppliers: () => fetchAPI('/api/v1/admin/suppliers'),
  createSupplier: (body: any) => fetchAPI('/api/v1/admin/suppliers', {
    method: 'POST',
    body: JSON.stringify(body),
  }),
  deleteSupplier: (id: string | number) => fetchAPI(`/api/v1/admin/suppliers/${id}`, {
    method: 'DELETE',
  }),
  getReturns: () => fetchAPI('/api/v1/admin/returns'),
  createReturn: (body: any) => fetchAPI('/api/v1/admin/returns', {
    method: 'POST',
    body: JSON.stringify(body),
  }),
  restockReturn: (id: string | number) => fetchAPI(`/api/v1/admin/returns/${id}/restock`, {
    method: 'POST',
  }),
  disposeReturn: (id: string | number) => fetchAPI(`/api/v1/admin/returns/${id}/dispose`, {
    method: 'POST',
  }),
  getWarehouseReceipts: () => fetchAPI('/api/v1/admin/warehouse/receipts'),
  getWarehouseReceipt: (code: string) => fetchAPI(`/api/v1/admin/warehouse/receipts/${code}`),
  createWarehouseReceipt: (body: any) => fetchAPI('/api/v1/admin/warehouse/receipts', {
    method: 'POST',
    body: JSON.stringify(body),
  }),
  createWarehouseInspection: (body: any) => fetchAPI('/api/v1/admin/warehouse/inspections', {
    method: 'POST',
    body: JSON.stringify(body),
  }),
  getVariantById: (id: string | number) => fetchAPI(`/api/v1/admin/variants/${id}`),
};

// Public Blog/Post endpoints
export const blogApi = {
  getPosts: () => fetchAPI('/api/v1/posts'),
  getPostById: (id: string | number) => fetchAPI(`/api/v1/posts/${id}`),
};
