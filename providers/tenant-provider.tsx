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
      
      // Obtener tenant_id y subdomain de cookies
      const tenantId = Cookies.get('tenant_id');
      const subdomain = Cookies.get('subdomain') || (process.env.NODE_ENV === 'development' ? 'dev' : null);
      
      // Si hay tenant_id en cookies, usar storefrontService que automáticamente envía el header
      if (tenantId) {
        const config = await storefrontService.getConfig();
        setTenant(config.tenant);
        setStorefront(config.storefront);
        return;
      }
      
      // Si hay subdomain pero no tenant_id, intentar obtener config usando subdomain
      if (subdomain) {
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
        const config = data.data;
        
        setTenant(config.tenant);
        setStorefront(config.storefront);
        
        // Guardar tenant_id en cookie para futuras peticiones
        if (config.tenant?.id) {
          Cookies.set('tenant_id', config.tenant.id, { expires: 7, path: '/' });
        }
        return;
      }
      
      // Si no hay tenant_id ni subdomain, intentar usar tenant por defecto
      const defaultTenantId = process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID;
      if (defaultTenantId) {
        // Establecer tenant_id en cookie y reintentar
        Cookies.set('tenant_id', defaultTenantId, { expires: 7, path: '/' });
        const config = await storefrontService.getConfig();
        setTenant(config.tenant);
        setStorefront(config.storefront);
        return;
      }
      
      // Si no hay ninguna forma de obtener el tenant, lanzar error
      throw new Error('No tenant found. Please provide tenant_id, subdomain, or configure NEXT_PUBLIC_DEFAULT_TENANT_ID');
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

