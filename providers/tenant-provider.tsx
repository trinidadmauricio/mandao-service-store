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
      
      // En desarrollo, si no hay tenant_id en cookies, usar 'dev' como subdomain por defecto
      const tenantId = Cookies.get('tenant_id');
      const subdomain = Cookies.get('subdomain') || (process.env.NODE_ENV === 'development' ? 'dev' : null);
      
      // Si hay subdomain pero no tenant_id, intentar obtener config usando subdomain
      let config;
      if (subdomain && !tenantId) {
        // Hacer petición con header X-Subdomain
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/v1/storefront/config`, {
          headers: {
            'X-Subdomain': subdomain,
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch config: ${response.statusText}`);
        }
        
        const data = await response.json();
        config = data.data;
      } else {
        config = await storefrontService.getConfig();
      }
      
      setTenant(config.tenant);
      setStorefront(config.storefront);
      
      // Guardar tenant_id en cookie si no está
      if (config.tenant?.id && !tenantId) {
        Cookies.set('tenant_id', config.tenant.id, { expires: 7, path: '/' });
      }
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

