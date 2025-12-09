'use client';

/**
 * Provider para contexto de carrito
 * Wrapper alrededor del store de Zustand para facilitar el uso
 */

import { useEffect } from 'react';
import { useCartStore } from '@/lib/store/cart-store';
import { useAuth } from './auth-provider';
import { useTenant } from './tenant-provider';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { tenant } = useTenant();
  const fetchCart = useCartStore((state) => state.fetchCart);

  // Cargar carrito al montar o cuando cambie el estado de autenticación o tenant
  useEffect(() => {
    // Solo intentar cargar el carrito si hay un tenant disponible
    if (tenant?.id) {
      fetchCart().catch((error) => {
        // Silenciar errores de carrito en desarrollo (puede que el backend no esté disponible)
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to fetch cart:', error);
        }
      });
    }
  }, [fetchCart, isAuthenticated, tenant?.id]);

  return <>{children}</>;
}

