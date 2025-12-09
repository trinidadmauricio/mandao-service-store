# Mandao Storefront - Task Tracking

## Estado de Tareas

### Fase 1: Backend APIs (mandao-service-api)

- [x] **1.0** Prisma Schema: Cart, CartItem, WishlistItem, Coupon (retail) + CustomerAddress (shared)
- [x] **1.1** Store Config API - usa Storefront (retail) + Tenant (shared)
- [x] **1.2** Public Categories API - usa Category (retail)
- [x] **1.3** Public Brands API - usa Brand (retail)
- [x] **1.4** Cart API core - usa Cart, CartItem, Product (retail)
- [ ] **1.5** Cart coupon/merge - usa Coupon (retail)
- [ ] **1.6** Customer Profile API - usa User (shared)
- [ ] **1.7** Customer Addresses API - usa CustomerAddress (shared)
- [ ] **1.8** Customer Orders API - usa Order, OrderItem (delivery)
- [ ] **1.9** Wishlist API - usa WishlistItem, Product (retail)
- [ ] **1.10** Search API - usa Product, Category, Brand (retail)

### Fase 2: Frontend Foundation (mandao-service-store)

- [x] **2.1** Inicializar proyecto Next.js 15 con TypeScript y Tailwind
- [x] **2.2** Crear cliente API y definiciones de tipos
- [x] **2.3** Implementar middleware multi-tenant
- [x] **2.4** Configurar providers (Tenant, Auth, Query, Cart)
- [x] **2.5** Inicializar componentes shadcn/ui

### Fase 3: Core Storefront

- [x] **3.1** Construir componentes layout (Header, Footer)
- [ ] **3.2** Crear Homepage con Hero y Featured Products
- [ ] **3.3** Construir Product Listing Page con filtros
- [ ] **3.4** Crear Product Detail Page
- [ ] **3.5** Implementar funcionalidad de Search

### Fase 4: Cart & Checkout

- [ ] **4.1** Crear Cart store con Zustand
- [ ] **4.2** Construir Cart drawer y page UI
- [ ] **4.3** Implementar flujo de Checkout
- [ ] **4.4** Integrar pago con Stripe

### Fase 5: Authentication & Account

- [ ] **5.1** Crear páginas Login y Register
- [ ] **5.2** Implementar flujo de Password reset
- [ ] **5.3** Construir Account dashboard
- [ ] **5.4** Agregar páginas Order history
- [ ] **5.5** Implementar Address management
- [ ] **5.6** Agregar funcionalidad Wishlist

### Fase 6: Template System

- [ ] **6.1** Crear infraestructura de Template system
- [ ] **6.2** Implementar Classic template

---

## Leyenda

- [ ] Pendiente
- [x] Completado
- [~] En progreso
