'use client';

/**
 * Provider para contexto de tenant
 * Proporciona información del tenant actual a toda la aplicación
 */

import { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import type { StorefrontConfig } from '@/types/api';
import { storefrontService } from '@/lib/api/services/storefront.service';

interface TenantContextValue {
  tenant: StorefrontConfig['tenant'] | null;
  storefront: StorefrontConfig['storefront'] | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<StorefrontConfig['tenant'] | null>(null);
  const [storefront, setStorefront] = useState<StorefrontConfig['storefront'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const config = await storefrontService.getConfig();
      setTenant(config.tenant);
      setStorefront(config.storefront);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load tenant config'));
      console.error('Error loading tenant config:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return (
    <TenantContext.Provider
      value={{
        tenant,
        storefront,
        isLoading,
        error,
        refetch: fetchConfig,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

