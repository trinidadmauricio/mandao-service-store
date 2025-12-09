/**
 * Tipos TypeScript para las respuestas de la API
 * Basados en los endpoints del storefront
 */

// ============================================
// Response Wrapper
// ============================================

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
}

// ============================================
// Storefront
// ============================================

export interface StorefrontConfig {
  storefront: {
    id: string;
    subdomain: string;
    custom_domain: string | null;
    is_active: boolean;
    theme_config: Record<string, unknown>;
    seo_config: Record<string, unknown> | null;
    business_hours: Record<string, unknown> | null;
    about_us: string | null;
    terms: string | null;
    privacy_policy: string | null;
  };
  tenant: {
    id: string;
    name: string;
    default_currency: string;
    default_locale: string;
  };
}

// ============================================
// Products
// ============================================

export interface ProductVariant {
  id: string;
  sku: string;
  option1_name: string | null;
  option1_value: string | null;
  option2_name: string | null;
  option2_value: string | null;
  option3_name: string | null;
  option3_value: string | null;
  price_adjustment: number;
  currency: string;
  image_url: string | null;
  is_active: boolean;
}

export interface StorefrontProduct {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category: {
    id: string;
    name: string;
  } | null;
  brand: {
    id: string;
    name: string;
  } | null;
  selling_price: number;
  compare_at_price: number | null;
  currency: string;
  images: Record<string, unknown>;
  featured_image_url: string | null;
  is_featured: boolean;
  has_variants: boolean;
  variants_count: number;
}

export interface StorefrontProductDetail extends StorefrontProduct {
  variants: ProductVariant[];
}

// ============================================
// Categories
// ============================================

export interface StorefrontCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  children?: StorefrontCategory[];
  product_count?: number;
}

export interface StorefrontCategoryDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  breadcrumbs: Array<{
    name: string;
    slug: string;
  }>;
}

// ============================================
// Brands
// ============================================

export interface StorefrontBrand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
}

// ============================================
// Cart
// ============================================

export interface CartItem {
  id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  total_items: number;
  coupon_code: string | null;
}

// ============================================
// Auth
// ============================================

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: string;
  email_verified: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface RegisterResponse {
  user: User;
  verification_token: string;
}

// ============================================
// Customer Address
// ============================================

export interface CustomerAddress {
  id: string;
  tenant_id: string;
  customer_id: string;
  label: string;
  recipient_name: string;
  phone: string;
  street: string;
  street_line_2: string | null;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  lat: number | null;
  lng: number | null;
  instructions: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// Orders
// ============================================

export interface Order {
  id: string;
  order_number: string;
  order_display_number: string;
  tracking_code: string;
  status: string;
  created_at: string;
  // ... otros campos según necesidad
}

// ============================================
// Wishlist
// ============================================

export interface WishlistItem {
  id: string;
  tenant_id: string;
  customer_id: string;
  product_id: string;
  variant_id: string | null;
  created_at: string;
  product?: StorefrontProduct;
}

// ============================================
// Search
// ============================================

export interface SearchResult {
  products: StorefrontProduct[];
  categories: StorefrontCategory[];
  brands: StorefrontBrand[];
  total: number;
}

