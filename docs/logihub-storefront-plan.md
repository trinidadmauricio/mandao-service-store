# Plan Técnico: LogiHub Storefront Multi-Tenant

## Documento de Especificación Técnica v1.0

---

## 1. Resumen Ejecutivo

### Objetivo
Desarrollar un frontend de e-commerce multi-tenant con Next.js que soporte múltiples tiendas a través de subdominios (ej: mitienda.mandao.com), con sistema de templates intercambiables y experiencia de usuario moderna.

### Alcance
- Frontend de tienda pública (storefront)
- Sistema de autenticación de clientes
- Carrito de compras persistente
- Checkout con integración de pagos
- Panel de cuenta del cliente
- Sistema de templates/layouts configurables
- Búsqueda y filtros avanzados

---

## 2. Arquitectura General

### 2.1 Modelo de Multi-Tenancy

```
┌─────────────────────────────────────────────────────────────┐
│                     DOMINIO PRINCIPAL                        │
│                       mandao.com                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  tienda1     │  │  tienda2     │  │  tienda3     │       │
│  │ .mandao.com  │  │ .mandao.com  │  │ .mandao.com  │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                 │                 │                │
│         ▼                 ▼                 ▼                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              NEXT.JS APPLICATION                     │    │
│  │         (Single deployment, multi-tenant)            │    │
│  └──────────────────────┬──────────────────────────────┘    │
│                         │                                    │
│                         ▼                                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              MANDAO SERVICE API                      │    │
│  │           (Backend con X-Tenant-Id header)           │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Flujo de Resolución de Tenant

```
1. Usuario visita: mitienda.mandao.com
                        │
                        ▼
2. Middleware Next.js extrae subdominio: "mitienda"
                        │
                        ▼
3. Consulta API: GET /api/v1/tenants/by-slug/mitienda
                        │
                        ▼
4. Cachea tenant_id en Edge (60 segundos)
                        │
                        ▼
5. Inyecta X-Tenant-Id en todas las requests
                        │
                        ▼
6. Renderiza app con contexto del tenant
```

### 2.3 Stack Tecnológico

| Capa | Tecnología | Justificación |
|------|------------|---------------|
| Framework | Next.js 15 (App Router) | SSR, RSC, Edge Runtime |
| Lenguaje | TypeScript 5.x | Type safety, DX |
| Estilos | Tailwind CSS 4 | Utility-first, performance |
| UI Components | shadcn/ui + Radix | Accesibilidad, customización |
| Estado Global | Zustand | Ligero, simple, persistencia |
| Data Fetching | TanStack Query v5 | Cache, mutations, SSR |
| Formularios | React Hook Form + Zod | Validación, performance |
| Animaciones | Framer Motion | Transiciones fluidas |
| Carousel | Embla Carousel | Ligero, touch-friendly |
| Iconos | Lucide React | Consistencia, tree-shaking |
| Testing | Vitest + Playwright | Unit + E2E |

---

## 3. Estructura del Proyecto

### 3.1 Arquitectura de Carpetas

```
logihub-storefront/
├── app/                              # App Router (rutas)
│   ├── (storefront)/                 # Grupo de rutas públicas
│   │   ├── layout.tsx                # Layout principal de tienda
│   │   ├── page.tsx                  # Homepage
│   │   ├── products/
│   │   │   ├── page.tsx              # Catálogo
│   │   │   └── [slug]/
│   │   │       └── page.tsx          # Detalle de producto
│   │   ├── categories/
│   │   │   └── [slug]/
│   │   │       └── page.tsx          # Productos por categoría
│   │   ├── brands/
│   │   │   └── [slug]/
│   │   │       └── page.tsx          # Productos por marca
│   │   ├── search/
│   │   │   └── page.tsx              # Resultados de búsqueda
│   │   ├── cart/
│   │   │   └── page.tsx              # Carrito de compras
│   │   └── checkout/
│   │       ├── page.tsx              # Checkout flow
│   │       ├── success/
│   │       │   └── page.tsx          # Confirmación de pago
│   │       └── cancel/
│   │           └── page.tsx          # Pago cancelado
│   │
│   ├── (auth)/                       # Grupo de rutas de auth
│   │   ├── layout.tsx                # Layout de auth (minimal)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   ├── reset-password/
│   │   │   └── page.tsx
│   │   └── verify-email/
│   │       └── page.tsx
│   │
│   ├── (account)/                    # Grupo de rutas protegidas
│   │   ├── layout.tsx                # Layout de cuenta
│   │   ├── account/
│   │   │   ├── page.tsx              # Dashboard
│   │   │   ├── profile/
│   │   │   │   └── page.tsx          # Editar perfil
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx          # Historial
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Detalle de orden
│   │   │   ├── addresses/
│   │   │   │   └── page.tsx          # Mis direcciones
│   │   │   └── wishlist/
│   │   │       └── page.tsx          # Lista de deseos
│   │
│   ├── api/                          # API Routes (BFF)
│   │   └── revalidate/
│   │       └── route.ts              # Webhook para ISR
│   │
│   ├── layout.tsx                    # Root layout
│   ├── not-found.tsx                 # 404 page
│   ├── error.tsx                     # Error boundary
│   └── loading.tsx                   # Global loading
│
├── components/
│   ├── ui/                           # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   │
│   ├── layout/                       # Componentes de layout
│   │   ├── header/
│   │   │   ├── header.tsx
│   │   │   ├── navigation.tsx
│   │   │   ├── search-bar.tsx
│   │   │   ├── cart-icon.tsx
│   │   │   └── user-menu.tsx
│   │   ├── footer/
│   │   │   └── footer.tsx
│   │   ├── sidebar/
│   │   │   └── category-sidebar.tsx
│   │   └── mobile-menu/
│   │       └── mobile-menu.tsx
│   │
│   ├── product/                      # Componentes de producto
│   │   ├── product-card.tsx
│   │   ├── product-grid.tsx
│   │   ├── product-gallery.tsx
│   │   ├── product-info.tsx
│   │   ├── variant-selector.tsx
│   │   ├── quantity-selector.tsx
│   │   ├── add-to-cart-button.tsx
│   │   ├── wishlist-button.tsx
│   │   └── product-reviews.tsx
│   │
│   ├── cart/                         # Componentes de carrito
│   │   ├── cart-drawer.tsx
│   │   ├── cart-item.tsx
│   │   ├── cart-summary.tsx
│   │   └── cart-empty.tsx
│   │
│   ├── checkout/                     # Componentes de checkout
│   │   ├── checkout-form.tsx
│   │   ├── address-form.tsx
│   │   ├── address-selector.tsx
│   │   ├── shipping-options.tsx
│   │   ├── payment-methods.tsx
│   │   └── order-summary.tsx
│   │
│   ├── search/                       # Componentes de búsqueda
│   │   ├── search-modal.tsx
│   │   ├── search-results.tsx
│   │   ├── search-suggestions.tsx
│   │   └── recent-searches.tsx
│   │
│   ├── filters/                      # Componentes de filtros
│   │   ├── filter-sidebar.tsx
│   │   ├── category-filter.tsx
│   │   ├── price-filter.tsx
│   │   ├── brand-filter.tsx
│   │   ├── attribute-filter.tsx
│   │   └── active-filters.tsx
│   │
│   ├── home/                         # Componentes de homepage
│   │   ├── hero-banner.tsx
│   │   ├── hero-carousel.tsx
│   │   ├── featured-products.tsx
│   │   ├── category-showcase.tsx
│   │   ├── promo-banner.tsx
│   │   └── newsletter-form.tsx
│   │
│   └── shared/                       # Componentes compartidos
│       ├── logo.tsx
│       ├── price.tsx
│       ├── rating.tsx
│       ├── badge.tsx
│       ├── breadcrumb.tsx
│       ├── pagination.tsx
│       ├── skeleton.tsx
│       ├── empty-state.tsx
│       └── error-boundary.tsx
│
├── templates/                        # Sistema de templates
│   ├── index.ts                      # Registry de templates
│   ├── classic/
│   │   ├── layout.tsx
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   └── styles.css
│   ├── modern/
│   │   ├── layout.tsx
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   └── styles.css
│   ├── minimal/
│   │   └── ...
│   └── fashion/
│       └── ...
│
├── lib/
│   ├── api/                          # API client
│   │   ├── client.ts                 # Axios/fetch instance
│   │   ├── endpoints.ts              # Endpoints constants
│   │   ├── types.ts                  # Response types
│   │   └── services/
│   │       ├── auth.service.ts
│   │       ├── products.service.ts
│   │       ├── cart.service.ts
│   │       ├── checkout.service.ts
│   │       ├── customer.service.ts
│   │       └── storefront.service.ts
│   │
│   ├── hooks/                        # Custom hooks
│   │   ├── use-cart.ts
│   │   ├── use-auth.ts
│   │   ├── use-tenant.ts
│   │   ├── use-wishlist.ts
│   │   ├── use-search.ts
│   │   └── use-debounce.ts
│   │
│   ├── store/                        # Zustand stores
│   │   ├── cart-store.ts
│   │   ├── auth-store.ts
│   │   ├── wishlist-store.ts
│   │   └── ui-store.ts
│   │
│   ├── utils/                        # Utilidades
│   │   ├── cn.ts                     # Class names merger
│   │   ├── format.ts                 # Formatters (price, date)
│   │   ├── validation.ts             # Zod schemas
│   │   └── seo.ts                    # SEO helpers
│   │
│   └── config/                       # Configuración
│       ├── site.ts                   # Site config
│       └── navigation.ts             # Nav items
│
├── providers/
│   ├── tenant-provider.tsx           # Contexto de tenant
│   ├── auth-provider.tsx             # Contexto de auth
│   ├── cart-provider.tsx             # Contexto de carrito
│   ├── query-provider.tsx            # TanStack Query
│   └── theme-provider.tsx            # Tema/Template
│
├── types/
│   ├── api.ts                        # Tipos de API responses
│   ├── product.ts                    # Product types
│   ├── cart.ts                       # Cart types
│   ├── order.ts                      # Order types
│   ├── customer.ts                   # Customer types
│   └── tenant.ts                     # Tenant types
│
├── styles/
│   ├── globals.css                   # Estilos globales
│   └── themes/                       # Variables por template
│       ├── classic.css
│       ├── modern.css
│       └── minimal.css
│
├── public/
│   ├── images/
│   └── fonts/
│
├── middleware.ts                     # Middleware multi-tenant
├── next.config.ts                    # Next.js config
├── tailwind.config.ts                # Tailwind config
├── tsconfig.json                     # TypeScript config
└── package.json
```

---

## 4. APIs Existentes - Plan de Integración

### 4.1 Mapeo de Endpoints a Funcionalidades

| Funcionalidad | Endpoint API | Método | Auth | Uso en Frontend |
|--------------|--------------|--------|------|-----------------|
| **Autenticación** |
| Login | `/api/v1/auth/login` | POST | No | Login page |
| Register | `/api/v1/auth/register` | POST | No | Register page |
| Verify Email | `/api/v1/auth/verify-email` | GET | No | Email verification |
| Reset Request | `/api/v1/auth/password/reset-request` | POST | No | Forgot password |
| Reset Password | `/api/v1/auth/password/reset` | POST | No | Reset password |
| **Storefront** |
| List Products | `/api/v1/storefront/products` | GET | Opcional | Catálogo, búsqueda |
| Get Product | `/api/v1/storefront/products/:id` | GET | Opcional | Detalle producto |
| Checkout | `/api/v1/storefront/checkout` | POST | Opcional | Crear orden |
| **Productos Admin** |
| List Products | `/api/v1/products` | GET | Sí | (No usado en storefront) |
| **Categorías** |
| List Categories | `/api/v1/categories` | GET | Sí | Navegación (adaptar) |
| **Marcas** |
| List Brands | `/api/v1/brands` | GET | Sí | Filtros (adaptar) |
| **Geocoding** |
| Search Address | `/api/v1/geocoding/search` | GET | Sí | Autocompletar dirección |
| Reverse Geocode | `/api/v1/geocoding/reverse` | GET | Sí | Obtener dirección |
| **Pagos** |
| Create Checkout | `/api/v1/payments/checkout` | POST | Sí | Pago con Stripe |
| Get Payments | `/api/v1/payments/orders/:orderId/payments` | GET | Sí | Historial pagos |
| **Órdenes Públicas** |
| Track Order | `/api/v1/public/orders/:trackingCode` | GET | No | Tracking público |
| **Tenant** |
| Get Tenant | `/api/v1/tenants/:id` | GET | Sí | Config tienda |

### 4.2 Servicios de API - Estructura

```typescript
// lib/api/services/storefront.service.ts

interface StorefrontService {
  // Productos
  getProducts(params: ProductsParams): Promise<PaginatedResponse<Product>>;
  getProduct(id: string): Promise<Product>;
  searchProducts(query: string): Promise<Product[]>;
  
  // Categorías (requiere endpoint público o adaptar)
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category>;
  
  // Marcas (requiere endpoint público o adaptar)
  getBrands(): Promise<Brand[]>;
  
  // Checkout
  createCheckout(data: CheckoutData): Promise<CheckoutResponse>;
  
  // Tracking
  trackOrder(trackingCode: string): Promise<PublicOrder>;
}

interface ProductsParams {
  page?: number;
  limit?: number;
  category_id?: string;
  brand_id?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
  in_stock?: boolean;
}
```

### 4.3 Flujo de Datos por Página

#### Homepage
```
1. getStoreConfig() → Logo, tema, banners
2. getFeaturedProducts() → Productos destacados
3. getCategories() → Navegación categorías
4. getPromotions() → Banners promocionales
```

#### Catálogo de Productos
```
1. getProducts(filters) → Lista paginada
2. getCategories() → Sidebar categorías
3. getBrands() → Filtro de marcas
4. getPriceRange() → Filtro de precio
```

#### Detalle de Producto
```
1. getProduct(id) → Info completa + variantes
2. getRelatedProducts(categoryId) → Productos relacionados
3. getProductReviews(id) → Reviews (si existe)
```

#### Checkout
```
1. validateCart() → Verificar stock
2. getCustomerAddresses() → Direcciones guardadas
3. calculateShipping(address) → Costos de envío
4. createCheckout(orderData) → Crear orden
5. createPaymentSession(orderId) → Sesión Stripe
```

---

## 5. APIs Faltantes - Especificación Completa

### 5.1 Cart API (Carrito)

#### Modelo de Datos
```typescript
interface Cart {
  id: string;
  tenant_id: string;
  customer_id: string | null;      // null para guests
  session_id: string | null;        // Para guests
  items: CartItem[];
  subtotal: number;
  tax_amount: number;
  shipping_amount: number | null;
  discount_amount: number;
  total: number;
  currency: string;
  coupon_code: string | null;
  expires_at: string;               // Para carritos guest
  created_at: string;
  updated_at: string;
}

interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    featured_image_url: string;
    current_stock: number;
  };
  variant: {
    id: string;
    sku: string;
    option1_name: string;
    option1_value: string;
    option2_name: string | null;
    option2_value: string | null;
    image_url: string | null;
  } | null;
}

interface AddToCartRequest {
  product_id: string;
  variant_id?: string;
  quantity: number;
}

interface UpdateCartItemRequest {
  quantity: number;
}
```

#### Endpoints

**GET `/api/v1/storefront/cart`**
```
Headers:
  - X-Tenant-Id: required
  - Authorization: optional (Bearer token)
  - X-Session-Id: required if not authenticated

Response 200:
{
  "status": "success",
  "data": Cart
}

Response 404 (carrito no existe):
{
  "status": "success",
  "data": {
    "id": null,
    "items": [],
    "subtotal": 0,
    "total": 0,
    "currency": "USD"
  }
}
```

**POST `/api/v1/storefront/cart/items`**
```
Headers:
  - X-Tenant-Id: required
  - Authorization: optional
  - X-Session-Id: required if not authenticated

Body:
{
  "product_id": "uuid",
  "variant_id": "uuid | null",
  "quantity": 1
}

Response 201:
{
  "status": "success",
  "data": Cart,
  "message": "Item added to cart"
}

Response 400 (stock insuficiente):
{
  "status": "error",
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Only 5 items available",
    "available_stock": 5
  }
}
```

**PATCH `/api/v1/storefront/cart/items/:itemId`**
```
Body:
{
  "quantity": 3
}

Response 200:
{
  "status": "success",
  "data": Cart,
  "message": "Cart updated"
}
```

**DELETE `/api/v1/storefront/cart/items/:itemId`**
```
Response 200:
{
  "status": "success",
  "data": Cart,
  "message": "Item removed from cart"
}
```

**DELETE `/api/v1/storefront/cart`**
```
Response 200:
{
  "status": "success",
  "message": "Cart cleared"
}
```

**POST `/api/v1/storefront/cart/coupon`**
```
Body:
{
  "code": "SAVE20"
}

Response 200:
{
  "status": "success",
  "data": Cart,
  "message": "Coupon applied"
}

Response 400:
{
  "status": "error",
  "error": {
    "code": "INVALID_COUPON",
    "message": "Coupon code is invalid or expired"
  }
}
```

**DELETE `/api/v1/storefront/cart/coupon`**
```
Response 200:
{
  "status": "success",
  "data": Cart,
  "message": "Coupon removed"
}
```

**POST `/api/v1/storefront/cart/merge`**
```
Descripción: Merge carrito de guest con carrito de usuario autenticado

Headers:
  - Authorization: required
  - X-Session-Id: required (del guest cart)

Response 200:
{
  "status": "success",
  "data": Cart,
  "message": "Carts merged successfully"
}
```

---

### 5.2 Customer Profile API

#### Modelo de Datos
```typescript
interface CustomerProfile {
  id: string;
  tenant_id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | null;
  locale: string;
  marketing_consent: boolean;
  default_address_id: string | null;
  created_at: string;
  updated_at: string;
}

interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  locale?: string;
  marketing_consent?: boolean;
}
```

#### Endpoints

**GET `/api/v1/storefront/customer/me`**
```
Headers:
  - Authorization: required

Response 200:
{
  "status": "success",
  "data": CustomerProfile
}
```

**PATCH `/api/v1/storefront/customer/me`**
```
Body: UpdateProfileRequest

Response 200:
{
  "status": "success",
  "data": CustomerProfile,
  "message": "Profile updated"
}
```

**POST `/api/v1/storefront/customer/me/avatar`**
```
Content-Type: multipart/form-data

Body:
  - avatar: File (image/jpeg, image/png, max 2MB)

Response 200:
{
  "status": "success",
  "data": {
    "avatar_url": "https://..."
  }
}
```

---

### 5.3 Customer Addresses API

#### Modelo de Datos
```typescript
interface CustomerAddress {
  id: string;
  customer_id: string;
  label: string;                    // "Casa", "Oficina", etc.
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
  instructions: string | null;      // Instrucciones de entrega
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

interface CreateAddressRequest {
  label: string;
  recipient_name: string;
  phone: string;
  street: string;
  street_line_2?: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  lat?: number;
  lng?: number;
  instructions?: string;
  is_default?: boolean;
}
```

#### Endpoints

**GET `/api/v1/storefront/customer/me/addresses`**
```
Response 200:
{
  "status": "success",
  "data": CustomerAddress[]
}
```

**POST `/api/v1/storefront/customer/me/addresses`**
```
Body: CreateAddressRequest

Response 201:
{
  "status": "success",
  "data": CustomerAddress,
  "message": "Address created"
}
```

**PATCH `/api/v1/storefront/customer/me/addresses/:id`**
```
Body: Partial<CreateAddressRequest>

Response 200:
{
  "status": "success",
  "data": CustomerAddress,
  "message": "Address updated"
}
```

**DELETE `/api/v1/storefront/customer/me/addresses/:id`**
```
Response 200:
{
  "status": "success",
  "message": "Address deleted"
}
```

**PATCH `/api/v1/storefront/customer/me/addresses/:id/default`**
```
Response 200:
{
  "status": "success",
  "data": CustomerAddress,
  "message": "Default address updated"
}
```

---

### 5.4 Customer Orders API

#### Modelo de Datos
```typescript
interface CustomerOrder {
  id: string;
  order_number: string;
  order_display_number: string;
  tracking_code: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total: number;
  currency: string;
  delivery_address: DeliveryAddress;
  payment_status: PaymentStatus;
  payment_method: string;
  estimated_delivery_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
}

type OrderStatus = 
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'READY_FOR_PICKUP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

type PaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';
```

#### Endpoints

**GET `/api/v1/storefront/customer/me/orders`**
```
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 10)
  - status: OrderStatus (optional)

Response 200:
{
  "status": "success",
  "data": CustomerOrder[],
  "total": 25,
  "page": 1,
  "limit": 10,
  "totalPages": 3
}
```

**GET `/api/v1/storefront/customer/me/orders/:id`**
```
Response 200:
{
  "status": "success",
  "data": CustomerOrder
}
```

---

### 5.5 Wishlist API

#### Modelo de Datos
```typescript
interface WishlistItem {
  id: string;
  customer_id: string;
  product_id: string;
  variant_id: string | null;
  added_at: string;
  product: {
    id: string;
    name: string;
    slug: string;
    selling_price: number;
    compare_at_price: number | null;
    featured_image_url: string;
    is_active: boolean;
    current_stock: number;
  };
}
```

#### Endpoints

**GET `/api/v1/storefront/customer/me/wishlist`**
```
Response 200:
{
  "status": "success",
  "data": WishlistItem[]
}
```

**POST `/api/v1/storefront/customer/me/wishlist`**
```
Body:
{
  "product_id": "uuid",
  "variant_id": "uuid | null"
}

Response 201:
{
  "status": "success",
  "data": WishlistItem,
  "message": "Added to wishlist"
}
```

**DELETE `/api/v1/storefront/customer/me/wishlist/:productId`**
```
Response 200:
{
  "status": "success",
  "message": "Removed from wishlist"
}
```

**POST `/api/v1/storefront/customer/me/wishlist/:productId/move-to-cart`**
```
Response 200:
{
  "status": "success",
  "data": Cart,
  "message": "Moved to cart"
}
```

---

### 5.6 Store Configuration API

#### Modelo de Datos
```typescript
interface StoreConfig {
  id: string;
  tenant_id: string;
  
  // Branding
  store_name: string;
  logo_url: string | null;
  favicon_url: string | null;
  
  // Theme
  template: 'classic' | 'modern' | 'minimal' | 'fashion';
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  
  // Contact
  contact_email: string;
  contact_phone: string | null;
  whatsapp_number: string | null;
  
  // Social
  social_links: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    youtube?: string;
  };
  
  // SEO
  meta_title: string;
  meta_description: string;
  
  // Business
  currency: string;
  locale: string;
  timezone: string;
  
  // Features
  features: {
    guest_checkout: boolean;
    reviews_enabled: boolean;
    wishlist_enabled: boolean;
    compare_enabled: boolean;
    newsletter_enabled: boolean;
  };
  
  // Payment methods
  payment_methods: {
    stripe: boolean;
    cash_on_delivery: boolean;
    bank_transfer: boolean;
  };
  
  // Policies
  policies: {
    terms_url: string | null;
    privacy_url: string | null;
    return_policy_url: string | null;
    shipping_policy_url: string | null;
  };
  
  // Homepage content
  homepage: {
    hero_banners: HeroBanner[];
    featured_categories: string[];
    promo_banners: PromoBanner[];
  };
}

interface HeroBanner {
  id: string;
  image_url: string;
  image_mobile_url: string | null;
  title: string;
  subtitle: string | null;
  button_text: string | null;
  button_url: string | null;
  position: number;
}

interface PromoBanner {
  id: string;
  image_url: string;
  title: string;
  url: string | null;
  position: number;
}
```

#### Endpoints

**GET `/api/v1/storefront/config`**
```
Descripción: Obtener configuración pública de la tienda (no requiere auth)

Headers:
  - X-Tenant-Id: required

Response 200:
{
  "status": "success",
  "data": StoreConfig
}

Cache: 60 segundos en edge
```

---

### 5.7 Storefront Categories API (Pública)

#### Endpoints

**GET `/api/v1/storefront/categories`**
```
Descripción: Listar categorías públicas con productos activos

Query Parameters:
  - include_children: boolean (default: true)
  - include_product_count: boolean (default: false)

Response 200:
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "name": "Electrónica",
      "slug": "electronica",
      "description": "...",
      "image_url": "https://...",
      "parent_id": null,
      "children": [
        {
          "id": "uuid",
          "name": "Smartphones",
          "slug": "smartphones",
          "parent_id": "uuid-parent",
          "product_count": 45
        }
      ],
      "product_count": 120
    }
  ]
}
```

**GET `/api/v1/storefront/categories/:slug`**
```
Response 200:
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "Electrónica",
    "slug": "electronica",
    "description": "...",
    "meta_title": "...",
    "meta_description": "...",
    "breadcrumbs": [
      { "name": "Home", "slug": "/" },
      { "name": "Electrónica", "slug": "/categories/electronica" }
    ]
  }
}
```

---

### 5.8 Storefront Brands API (Pública)

#### Endpoints

**GET `/api/v1/storefront/brands`**
```
Query Parameters:
  - include_product_count: boolean (default: false)

Response 200:
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "name": "Apple",
      "slug": "apple",
      "logo_url": "https://...",
      "product_count": 35
    }
  ]
}
```

---

### 5.9 Search API (Mejorada)

#### Endpoints

**GET `/api/v1/storefront/search`**
```
Query Parameters:
  - q: string (required, min 2 chars)
  - category_id: uuid (optional)
  - brand_id: uuid (optional)
  - min_price: number (optional)
  - max_price: number (optional)
  - in_stock: boolean (optional)
  - sort: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'bestseller'
  - page: number (default: 1)
  - limit: number (default: 20)

Response 200:
{
  "status": "success",
  "data": {
    "products": Product[],
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8,
    "facets": {
      "categories": [
        { "id": "uuid", "name": "Electrónica", "count": 50 }
      ],
      "brands": [
        { "id": "uuid", "name": "Apple", "count": 25 }
      ],
      "price_range": {
        "min": 10.00,
        "max": 5000.00
      }
    }
  }
}
```

**GET `/api/v1/storefront/search/suggestions`**
```
Descripción: Autocompletado de búsqueda

Query Parameters:
  - q: string (required, min 2 chars)
  - limit: number (default: 5)

Response 200:
{
  "status": "success",
  "data": {
    "products": [
      {
        "id": "uuid",
        "name": "iPhone 15 Pro",
        "slug": "iphone-15-pro",
        "featured_image_url": "https://...",
        "selling_price": 999.00
      }
    ],
    "categories": [
      { "id": "uuid", "name": "Smartphones", "slug": "smartphones" }
    ],
    "brands": [
      { "id": "uuid", "name": "Apple", "slug": "apple" }
    ]
  }
}
```

---

### 5.10 Product Reviews API

#### Modelo de Datos
```typescript
interface ProductReview {
  id: string;
  product_id: string;
  customer_id: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string | null;
  comment: string;
  is_verified_purchase: boolean;
  helpful_count: number;
  images: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
  customer: {
    first_name: string;
    last_name_initial: string;   // Solo inicial por privacidad
    avatar_url: string | null;
  };
}

interface ProductRatingSummary {
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}
```

#### Endpoints

**GET `/api/v1/storefront/products/:productId/reviews`**
```
Query Parameters:
  - page: number
  - limit: number
  - sort: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'

Response 200:
{
  "status": "success",
  "data": {
    "reviews": ProductReview[],
    "summary": ProductRatingSummary,
    "total": 50,
    "page": 1,
    "limit": 10
  }
}
```

**POST `/api/v1/storefront/products/:productId/reviews`**
```
Headers:
  - Authorization: required

Body:
{
  "rating": 5,
  "title": "Excelente producto",
  "comment": "Muy buena calidad...",
  "images": ["base64...", "base64..."]
}

Response 201:
{
  "status": "success",
  "data": ProductReview,
  "message": "Review submitted for approval"
}
```

**POST `/api/v1/storefront/reviews/:reviewId/helpful`**
```
Response 200:
{
  "status": "success",
  "data": { "helpful_count": 15 }
}
```

---

## 6. Sistema de Templates

### 6.1 Templates Disponibles

| Template | Descripción | Ideal para |
|----------|-------------|------------|
| **Classic** | Layout tradicional con sidebar de categorías | Tiendas con muchos productos |
| **Modern** | Full-width, hero prominente, grid dinámico | Marcas con identidad fuerte |
| **Minimal** | Diseño limpio, enfocado en productos | Productos premium |
| **Fashion** | Lookbook style, imágenes grandes | Ropa y accesorios |
| **Marketplace** | Estilo Amazon, filtros avanzados | Alto volumen de productos |

### 6.2 Estructura de un Template

```
templates/
└── modern/
    ├── index.ts              # Exports del template
    ├── layout.tsx            # Layout wrapper
    ├── components/
    │   ├── header.tsx        # Header específico
    │   ├── footer.tsx        # Footer específico
    │   ├── hero.tsx          # Hero banner
    │   ├── product-card.tsx  # Card de producto
    │   └── category-nav.tsx  # Navegación
    ├── styles/
    │   └── theme.css         # Variables CSS
    └── config.ts             # Configuración default
```

### 6.3 Registro de Templates

```typescript
// templates/index.ts
import * as classic from './classic';
import * as modern from './modern';
import * as minimal from './minimal';
import * as fashion from './fashion';

export const templates = {
  classic,
  modern,
  minimal,
  fashion,
} as const;

export type TemplateName = keyof typeof templates;

export function getTemplate(name: TemplateName) {
  return templates[name] || templates.classic;
}
```

### 6.4 Carga Dinámica de Template

```typescript
// providers/theme-provider.tsx
'use client';

import { createContext, useContext, useMemo } from 'react';
import { getTemplate, TemplateName } from '@/templates';
import { useStoreConfig } from '@/lib/hooks/use-store-config';

interface ThemeContextValue {
  template: TemplateName;
  components: ReturnType<typeof getTemplate>;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: config } = useStoreConfig();
  
  const value = useMemo(() => ({
    template: config?.template || 'classic',
    components: getTemplate(config?.template || 'classic'),
    colors: {
      primary: config?.primary_color || '#3B82F6',
      secondary: config?.secondary_color || '#64748B',
      accent: config?.accent_color || '#F59E0B',
    },
  }), [config]);
  
  return (
    <ThemeContext.Provider value={value}>
      <style jsx global>{`
        :root {
          --color-primary: ${value.colors.primary};
          --color-secondary: ${value.colors.secondary};
          --color-accent: ${value.colors.accent};
        }
      `}</style>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
```

---

## 7. UX/UI Research Requerido

### 7.1 Análisis de Competidores

#### E-commerce Generales (Internacional)
| Plataforma | Analizar |
|------------|----------|
| **Shopify Themes** | Sistema de templates, customización, checkout |
| **Amazon** | Búsqueda, filtros, reviews, "Frequently bought together" |
| **SHEIN** | Mobile-first, infinite scroll, gamification |
| **Zara** | Navegación visual, producto como héroe |
| **Nike** | Storytelling de marca, personalización |

#### E-commerce Regionales (Latam/CA)
| Plataforma | Analizar |
|------------|----------|
| **Mercado Libre** | Filtros, trust badges, métodos de pago locales |
| **Rappi** | UX móvil, carrito rápido, tracking |
| **Hugo App** | Delivery UX, tiempos estimados |
| **Liverpool MX** | Click & Collect, departamentos |
| **Falabella** | Multi-categoría, comparador |

### 7.2 Puntos de Investigación por Área

#### Homepage
- [ ] Estructura de hero banners efectivos
- [ ] Grid vs Carousel para productos destacados
- [ ] Categorías visuales vs texto
- [ ] Newsletter signup: popup vs inline
- [ ] Trust badges y garantías
- [ ] Testimonios de clientes

#### Navegación
- [ ] Mega menu vs dropdown simple
- [ ] Sticky header: sí/no, comportamiento
- [ ] Breadcrumbs: formato y ubicación
- [ ] Mobile: bottom nav vs hamburger
- [ ] Quick search: inline vs modal

#### Product Listing (PLP)
- [ ] Grid: 3, 4, 5 columnas
- [ ] Filtros: sidebar vs horizontal
- [ ] Chips de filtros activos
- [ ] Ordenamiento: opciones más usadas
- [ ] Infinite scroll vs paginación
- [ ] Quick view modal
- [ ] Vista de lista vs grid (toggle)

#### Product Detail (PDP)
- [ ] Galería: thumbnails, zoom, video
- [ ] Sticky add to cart (mobile)
- [ ] Tabs vs acordeón para descripción
- [ ] Variantes: botones vs dropdown
- [ ] Cantidad: input vs +/- buttons
- [ ] Size guide modal
- [ ] Recently viewed products
- [ ] "Clientes también compraron"

#### Cart
- [ ] Drawer (slide-out) vs página dedicada
- [ ] Mini cart en header
- [ ] Guardar para después
- [ ] Productos recomendados en carrito
- [ ] Estimación de envío en carrito
- [ ] Código de cupón: dónde ubicar

#### Checkout
- [ ] Single page vs multi-step
- [ ] Guest checkout vs login obligatorio
- [ ] Progress indicator
- [ ] Autocompletar dirección
- [ ] Selección de dirección guardada
- [ ] Métodos de pago: diseño
- [ ] Order summary: sticky sidebar

#### Account
- [ ] Dashboard: métricas o accesos rápidos
- [ ] Historial de pedidos: información mostrada
- [ ] Tracking inline vs página separada
- [ ] Gestión de direcciones: UI
- [ ] Wishlist: compartible o no

#### Mobile Específico
- [ ] Tamaño de touch targets (44px min)
- [ ] Gestos: swipe to delete, pull to refresh
- [ ] Bottom sheets vs modals
- [ ] Teclado numérico para cantidades
- [ ] Add to cart animation
- [ ] Haptic feedback

### 7.3 Herramientas de Research

| Tipo | Herramientas |
|------|--------------|
| **Benchmarking** | Mobbin, Page Flows, Baymard Institute |
| **Analytics** | Hotjar, FullStory, PostHog |
| **A/B Testing** | Optimizely, VWO, Split.io |
| **Accesibilidad** | WAVE, Axe, Lighthouse |
| **Performance** | WebPageTest, GTmetrix |

### 7.4 Métricas de Éxito UX

| Métrica | Target | Cómo medir |
|---------|--------|------------|
| Bounce Rate Homepage | < 40% | Analytics |
| Add to Cart Rate | > 8% | Events |
| Cart Abandonment | < 70% | Funnel |
| Checkout Completion | > 65% | Funnel |
| Page Load (LCP) | < 2.5s | Core Web Vitals |
| Mobile Usability | 100/100 | Lighthouse |
| Accessibility | AA | WCAG audit |

### 7.5 Deliverables de Research

1. **Documento de Benchmark**
   - Screenshots anotados de competidores
   - Patrones identificados
   - Best practices por área

2. **User Flows**
   - Diagrama: Browse → Cart → Checkout
   - Diagrama: Account creation → First purchase
   - Diagrama: Return customer flow

3. **Wireframes Low-Fidelity**
   - Homepage (desktop/mobile)
   - PLP con filtros
   - PDP completo
   - Cart drawer
   - Checkout steps
   - Account pages

4. **Style Guide Base**
   - Paleta de colores por template
   - Tipografía: heading/body
   - Espaciado: scale
   - Componentes base (buttons, inputs, cards)
   - Iconografía

5. **Prototipos Interactivos**
   - Flow de compra completo
   - Variantes de componentes
   - Estados (loading, error, empty)

---

## 8. Configuración de Desarrollo

### 8.1 Comandos Iniciales

```bash
# Crear proyecto Next.js
npx create-next-app@latest logihub-storefront \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

# Entrar al proyecto
cd logihub-storefront

# Instalar dependencias core
npm install @tanstack/react-query axios zustand \
  react-hook-form @hookform/resolvers zod \
  date-fns clsx tailwind-merge \
  lucide-react

# Instalar shadcn/ui
npx shadcn@latest init

# Agregar componentes shadcn
npx shadcn@latest add button input card dialog \
  dropdown-menu sheet tabs badge separator \
  skeleton toast form select checkbox radio-group \
  accordion avatar popover command

# Instalar animaciones y carousel
npm install framer-motion embla-carousel-react

# Instalar utilidades
npm install @next/bundle-analyzer
npm install -D @types/node prettier eslint-config-prettier
```

### 8.2 Variables de Entorno

```env
# .env.local

# API
NEXT_PUBLIC_API_URL=https://api.mandao.com
NEXT_PUBLIC_API_VERSION=v1

# Dominio
NEXT_PUBLIC_DOMAIN=mandao.com
NEXT_PUBLIC_PROTOCOL=https

# Stripe (public key)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Analytics (opcional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXX

# Feature flags
NEXT_PUBLIC_ENABLE_REVIEWS=true
NEXT_PUBLIC_ENABLE_WISHLIST=true
```

### 8.3 Next.js Config

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.mandao.com',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
    ],
  },
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ];
  },
  
  experimental: {
    optimizePackageImports: ['lucide-react', '@headlessui/react'],
  },
};

export default nextConfig;
```

### 8.4 Middleware Multi-Tenant

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const MAIN_DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'mandao.com';

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const subdomain = hostname.replace(`.${MAIN_DOMAIN}`, '').split('.')[0];
  
  // Skip para dominio principal o localhost
  if (
    hostname === MAIN_DOMAIN ||
    hostname === `www.${MAIN_DOMAIN}` ||
    hostname.includes('localhost')
  ) {
    return NextResponse.next();
  }
  
  // Validar que el subdomain existe (caché en edge)
  const tenantResponse = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/tenants/by-slug/${subdomain}`,
    { next: { revalidate: 60 } }
  );
  
  if (!tenantResponse.ok) {
    return NextResponse.redirect(new URL('/', `https://${MAIN_DOMAIN}`));
  }
  
  const tenant = await tenantResponse.json();
  
  // Agregar headers de tenant
  const response = NextResponse.next();
  response.headers.set('x-tenant-id', tenant.data.id);
  response.headers.set('x-tenant-slug', subdomain);
  
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

---

## 9. Checklist de Implementación

### Fase 1: Fundamentos
- [ ] Proyecto Next.js creado y configurado
- [ ] Tailwind CSS + shadcn/ui setup
- [ ] API client con interceptors
- [ ] Middleware multi-tenant funcionando
- [ ] TenantProvider con contexto
- [ ] AuthProvider básico
- [ ] Layout base (header, footer)

### Fase 2: Catálogo
- [ ] Homepage con hero y productos
- [ ] Listado de productos con grid
- [ ] Filtros (categoría, marca, precio)
- [ ] Ordenamiento
- [ ] Paginación
- [ ] Detalle de producto
- [ ] Galería de imágenes
- [ ] Selector de variantes
- [ ] Búsqueda con sugerencias

### Fase 3: Carrito
- [ ] Cart store (Zustand)
- [ ] Add to cart funcionalidad
- [ ] Cart drawer/sidebar
- [ ] Actualizar cantidad
- [ ] Remover item
- [ ] Persistencia localStorage
- [ ] Sincronización con API (si auth)

### Fase 4: Checkout
- [ ] Formulario de cliente
- [ ] Selector de direcciones
- [ ] Geocoding para nueva dirección
- [ ] Resumen de orden
- [ ] Integración Stripe
- [ ] Success page
- [ ] Error handling

### Fase 5: Cuenta
- [ ] Login / Register
- [ ] Verificación email
- [ ] Forgot/Reset password
- [ ] Dashboard de cuenta
- [ ] Historial de pedidos
- [ ] Detalle de orden
- [ ] Gestión de direcciones
- [ ] Wishlist

### Fase 6: Templates
- [ ] Sistema de templates
- [ ] Template Classic
- [ ] Template Modern
- [ ] Template Minimal
- [ ] Selector dinámico por config

### Fase 7: Polish
- [ ] Loading states
- [ ] Error boundaries
- [ ] Empty states
- [ ] SEO metadata
- [ ] Open Graph
- [ ] Sitemap
- [ ] Performance optimization
- [ ] Mobile testing

---

## 10. Consideraciones Adicionales

### 10.1 SEO

- Metadata dinámica por página y producto
- Structured Data (JSON-LD) para productos, breadcrumbs
- Sitemap dinámico por tenant
- Canonical URLs con subdominio
- Robots.txt por tenant

### 10.2 Internacionalización (Futuro)

- Preparar estructura para i18n
- next-intl o similar
- Traducciones en products (ya existe en API)
- Formato de moneda/fecha por locale

### 10.3 Analytics

- Google Analytics 4
- Meta Pixel (Facebook)
- Eventos de e-commerce estándar
- Custom events por interacción

### 10.4 Performance

- Image optimization (next/image)
- Lazy loading de componentes
- Route prefetching
- ISR para productos
- Edge caching para config
- Bundle analysis

### 10.5 Seguridad

- CSRF en formularios
- XSS prevention
- Content Security Policy
- Rate limiting (API side)
- Sanitización de inputs

---

**Documento preparado para: LogiHub Storefront**  
**Versión: 1.0**  
**Fecha: Diciembre 2024**
