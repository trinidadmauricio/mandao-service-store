'use client';

/**
 * Provider raíz que combina todos los providers
 */

import { QueryProvider } from './query-provider';
import { TenantProvider } from './tenant-provider';
import { AuthProvider } from './auth-provider';
import { CartProvider } from './cart-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <TenantProvider>
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </TenantProvider>
    </QueryProvider>
  );
}

