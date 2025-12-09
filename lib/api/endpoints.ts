/**
 * Definición de endpoints de la API
 * Basado en los endpoints públicos del storefront
 */

const API_BASE = '/api/v1';

export const endpoints = {
  // Auth
  auth: {
    login: `${API_BASE}/auth/login`,
    register: `${API_BASE}/auth/register`,
    refresh: `${API_BASE}/auth/refresh`,
    forgotPassword: `${API_BASE}/auth/forgot-password`,
    resetPassword: `${API_BASE}/auth/reset-password`,
    verifyEmail: `${API_BASE}/auth/verify-email`,
  },

  // Storefront (público)
  storefront: {
    config: `${API_BASE}/storefront/config`,
    products: `${API_BASE}/storefront/products`,
    product: (id: string) => `${API_BASE}/storefront/products/${id}`,
    categories: `${API_BASE}/storefront/categories`,
    category: (slug: string) => `${API_BASE}/storefront/categories/${slug}`,
    brands: `${API_BASE}/storefront/brands`,
  },

  // Cart
  cart: {
    get: `${API_BASE}/cart`,
    addItem: `${API_BASE}/cart/items`,
    updateItem: (itemId: string) => `${API_BASE}/cart/items/${itemId}`,
    removeItem: (itemId: string) => `${API_BASE}/cart/items/${itemId}`,
    clear: `${API_BASE}/cart/clear`,
  },

  // Checkout
  checkout: {
    create: `${API_BASE}/storefront/checkout`,
  },

  // Customer (requiere auth)
  customer: {
    profile: `${API_BASE}/users/me`,
    updateProfile: `${API_BASE}/users/me`,
    addresses: `${API_BASE}/customer/addresses`,
    address: (id: string) => `${API_BASE}/customer/addresses/${id}`,
    orders: `${API_BASE}/customer/orders`,
    order: (id: string) => `${API_BASE}/customer/orders/${id}`,
  },

  // Wishlist (requiere auth)
  wishlist: {
    list: `${API_BASE}/wishlist`,
    add: `${API_BASE}/wishlist`,
    remove: (productId: string, variantId?: string) =>
      `${API_BASE}/wishlist/${productId}${variantId ? `?variant_id=${variantId}` : ''}`,
  },

  // Search
  search: {
    products: `${API_BASE}/storefront/search`,
  },
} as const;

