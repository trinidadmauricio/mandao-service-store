'use client';

/**
 * Provider raíz que combina todos los providers
 */

import { QueryProvider } from './query-provider';
import { TenantProvider } from './tenant-provider';
import { AuthProvider } from './auth-provider';
import { CartProvider } from './cart-provider';
import { ThemeProvider } from './theme-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <TenantProvider>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>{children}</CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </TenantProvider>
    </QueryProvider>
  );
}

