'use client';

/**
 * Provider para contexto de carrito
 * Wrapper alrededor del store de Zustand para facilitar el uso
 */

import { useEffect } from 'react';
import { useCartStore } from '@/lib/store/cart-store';
import { useAuth } from './auth-provider';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const fetchCart = useCartStore((state) => state.fetchCart);

  // Cargar carrito al montar o cuando cambie el estado de autenticación
  useEffect(() => {
    fetchCart();
  }, [fetchCart, isAuthenticated]);

  return <>{children}</>;
}

